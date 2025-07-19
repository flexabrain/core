import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { generateToken, optionalAuth } from '../middleware/auth';
import { getDB } from '../services/database';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { User, CreateUserData, LoginCredentials } from '../models/User';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
  company: Joi.string().max(255)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register new user
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body);
  
  if (error) {
    throw createError('Validation failed: ' + error.details[0].message, 400, 'VALIDATION_ERROR');
  }

  const { email, password, firstName, lastName, company } = value as CreateUserData;
  const db = getDB();

  // Check if user already exists
  const existingUser = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    throw createError('User already exists with this email', 409, 'USER_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user with 7-day trial for Pro features
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  const result = await db.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, company, role, trial_ends_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, first_name, last_name, company, role, trial_ends_at, created_at`,
    [email.toLowerCase(), passwordHash, firstName, lastName, company, 'free', trialEndsAt]
  );

  const user = result.rows[0];

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  logger.info('New user registered', {
    userId: user.id,
    email: user.email,
    ip: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      company: user.company,
      role: user.role,
      trialEndsAt: user.trial_ends_at,
      createdAt: user.created_at
    },
    token,
    trialInfo: {
      isTrialActive: true,
      trialEndsAt: user.trial_ends_at,
      daysRemaining: 7
    }
  });
}));

// Login user
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body);
  
  if (error) {
    throw createError('Invalid email or password', 400, 'INVALID_CREDENTIALS');
  }

  const { email, password } = value as LoginCredentials;
  const db = getDB();

  // Find user by email
  const result = await db.query(
    `SELECT id, email, password_hash, first_name, last_name, company, role, 
            subscription_status, trial_ends_at, is_active, last_login_at
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    throw createError('Account is deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!isValidPassword) {
    throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login time
  await db.query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  // Check trial status
  const now = new Date();
  const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const isTrialActive = trialEndsAt && now < trialEndsAt;
  const daysRemaining = trialEndsAt 
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  logger.info('User logged in', {
    userId: user.id,
    email: user.email,
    ip: req.ip,
    lastLogin: user.last_login_at
  });

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      company: user.company,
      role: user.role,
      subscriptionStatus: user.subscription_status,
      lastLoginAt: user.last_login_at
    },
    token,
    trialInfo: trialEndsAt ? {
      isTrialActive,
      trialEndsAt,
      daysRemaining
    } : null
  });
}));

// Get current user profile
router.get('/me', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const db = getDB();
  const result = await db.query(
    `SELECT id, email, first_name, last_name, company, role, subscription_status,
            trial_ends_at, created_at, last_login_at, is_active
     FROM users WHERE id = $1`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];

  // Get daily usage for all agents
  const { getDailyUsage } = await import('../services/redis');
  const oracleUsage = await getDailyUsage(user.id, 'oracle');
  const sentinelUsage = await getDailyUsage(user.id, 'sentinel');
  const sageUsage = await getDailyUsage(user.id, 'sage');

  // Check trial status
  const now = new Date();
  const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const isTrialActive = trialEndsAt && now < trialEndsAt;

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      company: user.company,
      role: user.role,
      subscriptionStatus: user.subscription_status,
      trialEndsAt: user.trial_ends_at,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      isActive: user.is_active
    },
    usage: {
      oracle: oracleUsage,
      sentinel: sentinelUsage,
      sage: sageUsage
    },
    trialInfo: trialEndsAt ? {
      isTrialActive,
      trialEndsAt,
      daysRemaining: isTrialActive 
        ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0
    } : null
  });
}));

// Refresh JWT token
router.post('/refresh', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  // Generate new token
  const token = generateToken({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  });

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    token
  });
}));

// Logout (client-side token invalidation)
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  // In a stateless JWT system, logout is typically handled client-side
  // by removing the token. We log the event for audit purposes.
  
  if (req.user) {
    logger.info('User logged out', {
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip
    });
  }

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

export { router as authRoutes };