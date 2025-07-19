import { Router, Request, Response } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getDB } from '../services/database';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { getDailyUsage } from '../services/redis';

const router = Router();

// Update user profile validation schema
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
  company: Joi.string().max(255),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

// Update user profile
router.patch('/profile', 
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = updateProfileSchema.validate(req.body);
    
    if (error) {
      throw createError('Validation failed: ' + error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { firstName, lastName, company } = value;
    const userId = req.user!.id;
    const db = getDB();

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      values.push(firstName);
      paramIndex++;
    }

    if (lastName !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      values.push(lastName);
      paramIndex++;
    }

    if (company !== undefined) {
      updates.push(`company = $${paramIndex}`);
      values.push(company);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw createError('No valid fields to update', 400, 'NO_UPDATES');
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    // Add user ID for WHERE clause
    values.push(userId);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} 
       WHERE id = $${paramIndex} 
       RETURNING id, email, first_name, last_name, company, role, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    const user = result.rows[0];

    logger.info('User profile updated', {
      userId,
      updatedFields: Object.keys(value)
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        role: user.role,
        updatedAt: user.updated_at
      }
    });
  })
);

// Change password
router.post('/change-password',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = changePasswordSchema.validate(req.body);
    
    if (error) {
      throw createError('Validation failed: ' + error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { currentPassword, newPassword } = value;
    const userId = req.user!.id;
    const db = getDB();

    // Get current password hash
    const result = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    const currentPasswordHash = result.rows[0].password_hash;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);
    
    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    logger.info('User password changed', { userId });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

// Get user dashboard data
router.get('/dashboard',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const db = getDB();

    // Get user basic info
    const userResult = await db.query(
      `SELECT id, email, first_name, last_name, company, role, 
              subscription_status, trial_ends_at, created_at, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    const user = userResult.rows[0];

    // Get usage statistics
    const oracleUsage = await getDailyUsage(userId, 'oracle');
    const sentinelUsage = await getDailyUsage(userId, 'sentinel');
    const sageUsage = await getDailyUsage(userId, 'sage');

    // Get recent query history
    const recentQueries = await db.query(
      `SELECT agent_type, query_text, response_time_ms, created_at
       FROM usage_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    );

    // Get usage trends (last 7 days)
    const usageTrends = await db.query(
      `SELECT DATE(created_at) as date, agent_type, COUNT(*) as queries
       FROM usage_logs 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at), agent_type
       ORDER BY date DESC`,
      [userId]
    );

    // Calculate trial status
    const now = new Date();
    const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const isTrialActive = trialEndsAt && now < trialEndsAt;
    const daysRemaining = trialEndsAt 
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    // Calculate account age
    const accountAge = Math.floor((now.getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      dashboard: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          company: user.company,
          role: user.role,
          subscriptionStatus: user.subscription_status,
          accountAge,
          lastLoginAt: user.last_login_at
        },
        usage: {
          today: {
            oracle: oracleUsage,
            sentinel: sentinelUsage,
            sage: sageUsage,
            total: oracleUsage + sentinelUsage + sageUsage
          },
          trends: usageTrends.rows.reduce((acc: any, row: any) => {
            if (!acc[row.date]) acc[row.date] = {};
            acc[row.date][row.agent_type] = parseInt(row.queries);
            return acc;
          }, {})
        },
        recentActivity: recentQueries.rows.map(query => ({
          agent: query.agent_type,
          query: query.query_text?.substring(0, 100) + (query.query_text?.length > 100 ? '...' : ''),
          responseTime: query.response_time_ms,
          timestamp: query.created_at
        })),
        trial: trialEndsAt ? {
          isActive: isTrialActive,
          endsAt: trialEndsAt,
          daysRemaining,
          showUpgrade: !isTrialActive || daysRemaining <= 3
        } : null,
        recommendations: generateDashboardRecommendations(user, oracleUsage, sentinelUsage, sageUsage)
      }
    });
  })
);

// Admin: List all users
router.get('/admin/users',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    const db = getDB();
    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.company, u.role,
             u.subscription_status, u.trial_ends_at, u.created_at, u.last_login_at, u.is_active,
             COUNT(ul.id) as total_queries
      FROM users u
      LEFT JOIN usage_logs ul ON u.id = ul.user_id
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` WHERE (u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await db.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users';
    const countParams: any[] = [];
    
    if (search) {
      countQuery += ' WHERE (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)';
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalUsers = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      users: result.rows.map(user => ({
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
        isActive: user.is_active,
        totalQueries: parseInt(user.total_queries)
      })),
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  })
);

// Admin: Update user role/status
router.patch('/admin/users/:userId',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const db = getDB();
    
    // Validate role
    if (role && !['free', 'pro', 'enterprise', 'admin'].includes(role)) {
      throw createError('Invalid role', 400, 'INVALID_ROLE');
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw createError('No valid fields to update', 400, 'NO_UPDATES');
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    logger.info('Admin updated user', {
      adminId: req.user!.id,
      targetUserId: userId,
      changes: { role, isActive }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });
  })
);

// Helper function to generate dashboard recommendations
function generateDashboardRecommendations(user: any, oracleUsage: number, sentinelUsage: number, sageUsage: number): any[] {
  const recommendations = [];

  // Usage-based recommendations
  if (user.role === 'free' && oracleUsage >= 3) {
    recommendations.push({
      type: 'upgrade',
      title: 'Approaching Daily Limit',
      message: `You've used ${oracleUsage}/5 Oracle queries today. Upgrade for unlimited access!`,
      action: 'Upgrade to Pro',
      priority: 'high'
    });
  }

  if (user.role === 'free' && oracleUsage === 0) {
    recommendations.push({
      type: 'engagement',
      title: 'Try Your First Oracle Query',
      message: 'Get sales insights and forecasting with our AI-powered Oracle agent',
      action: 'Ask Oracle',
      priority: 'medium'
    });
  }

  // Trial recommendations
  const now = new Date();
  const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
  if (trialEndsAt && now < trialEndsAt) {
    const daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 3) {
      recommendations.push({
        type: 'trial',
        title: `Trial Ends in ${daysRemaining} Days`,
        message: 'Don\'t lose access to Pro features. Upgrade now!',
        action: 'Subscribe to Pro',
        priority: 'high'
      });
    }
  }

  return recommendations;
}

export { router as userRoutes };