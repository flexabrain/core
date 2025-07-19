import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, ROLE_PERMISSIONS } from '../models/User';
import { createError } from './errorHandler';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw createError('Access token required', 401, 'MISSING_TOKEN');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    
    logger.debug('Token authenticated', {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role
    });
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Token expired', 401, 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token', 401, 'INVALID_TOKEN');
    } else {
      throw createError('Authentication failed', 401, 'AUTH_FAILED');
    }
  }
};

// Optional authentication - doesn't throw error if no token
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
  } catch (error) {
    // Ignore authentication errors for optional auth
    logger.debug('Optional auth failed', error);
  }

  next();
};

// Role-based authorization middleware
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    if (!roles.includes(req.user.role)) {
      throw createError(
        `Access denied. Required roles: ${roles.join(', ')}`, 
        403, 
        'INSUFFICIENT_PERMISSIONS',
        { required: roles, current: req.user.role }
      );
    }

    next();
  };
};

// Feature-based authorization
export const requireFeature = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const userRole = req.user.role as keyof typeof ROLE_PERMISSIONS;
    const rolePermissions = ROLE_PERMISSIONS[userRole];

    if (!rolePermissions) {
      throw createError('Invalid user role', 403, 'INVALID_ROLE');
    }

    // Admin has access to all features
    if ((rolePermissions.features as readonly string[]).includes('*') ||
        (rolePermissions.features as readonly string[]).includes(feature)) {
      return next();
    }

    throw createError(
      `Feature access denied: ${feature}`, 
      403, 
      'FEATURE_ACCESS_DENIED',
      { required: feature, available: rolePermissions.features }
    );
  };
};

// Agent access authorization
export const requireAgentAccess = (agent: 'oracle' | 'sentinel' | 'sage') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const userRole = req.user.role as keyof typeof ROLE_PERMISSIONS;
    const rolePermissions = ROLE_PERMISSIONS[userRole];

    if (!(rolePermissions.agents as readonly string[]).includes(agent)) {
      throw createError(
        `Access denied to ${agent} agent`, 
        403, 
        'AGENT_ACCESS_DENIED',
        { 
          agent, 
          availableAgents: rolePermissions.agents,
          upgradeRequired: true 
        }
      );
    }

    next();
  };
};

// Usage limit check middleware
export const checkUsageLimit = (agent: 'oracle' | 'sentinel' | 'sage') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw createError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const userRole = req.user.role as keyof typeof ROLE_PERMISSIONS;
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    const dailyLimit = rolePermissions.dailyLimits[agent];

    // Unlimited usage for this role
    if (dailyLimit === -1) {
      return next();
    }

    // No access to this agent
    if (dailyLimit === 0) {
      throw createError(
        `No access to ${agent} agent`, 
        403, 
        'AGENT_ACCESS_DENIED',
        { upgradeRequired: true }
      );
    }

    try {
      // Import Redis functions dynamically to avoid circular dependency
      const { getDailyUsage } = await import('../services/redis');
      const currentUsage = await getDailyUsage(req.user.id, agent);

      if (currentUsage >= dailyLimit) {
        throw createError(
          `Daily limit reached for ${agent} agent (${dailyLimit} queries/day)`, 
          429, 
          'USAGE_LIMIT_EXCEEDED',
          {
            agent,
            limit: dailyLimit,
            used: currentUsage,
            upgradeRequired: true
          }
        );
      }

      // Add usage info to request for potential use in response
      (req as any).usageInfo = {
        agent,
        limit: dailyLimit,
        used: currentUsage,
        remaining: dailyLimit - currentUsage
      };

      next();
    } catch (error: any) {
      if (error?.code === 'USAGE_LIMIT_EXCEEDED') {
        throw error;
      }
      logger.error('Error checking usage limit:', error);
      // Fail open - allow request if Redis is down
      next();
    }
  };
};

// Admin-only middleware
export const requireAdmin = requireRole('admin');

// Enterprise-only middleware
export const requireEnterprise = requireRole('enterprise', 'admin');

// Paid tier middleware
export const requirePaid = requireRole('pro', 'enterprise', 'admin');

// Generate JWT token
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'flexabrain-oracle-api'
    }
  );
};

// Verify and decode token without middleware
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};