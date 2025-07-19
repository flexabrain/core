import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getDB } from '../services/database';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Admin Dashboard - Key Metrics
router.get('/dashboard', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB();
    
    // Get user statistics
    const userStats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'free' THEN 1 END) as free_users,
        COUNT(CASE WHEN role = 'pro' THEN 1 END) as pro_users,
        COUNT(CASE WHEN role = 'enterprise' THEN 1 END) as enterprise_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
        COUNT(CASE WHEN last_login_at >= NOW() - INTERVAL '7 days' THEN 1 END) as active_users_7d
      FROM users
    `);

    // Get usage statistics
    const usageStats = await db.query(`
      SELECT 
        COUNT(*) as total_queries,
        COUNT(CASE WHEN agent_type = 'oracle' THEN 1 END) as oracle_queries,
        COUNT(CASE WHEN agent_type = 'sentinel' THEN 1 END) as sentinel_queries,
        COUNT(CASE WHEN agent_type = 'sage' THEN 1 END) as sage_queries,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as queries_24h,
        AVG(response_time_ms) as avg_response_time
      FROM usage_logs
    `);

    // Get subscription statistics
    const subscriptionStats = await db.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'trialing' THEN 1 END) as trial_subscriptions,
        COUNT(CASE WHEN plan = 'pro' THEN 1 END) as pro_subscriptions,
        COUNT(CASE WHEN plan = 'enterprise' THEN 1 END) as enterprise_subscriptions
      FROM subscriptions
    `);

    // Get daily usage trends (last 30 days)
    const usageTrends = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as queries,
        COUNT(DISTINCT user_id) as active_users
      FROM usage_logs 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Calculate conversion metrics
    const conversionStats = await db.query(`
      SELECT 
        COUNT(CASE WHEN u.role = 'free' AND u.created_at <= NOW() - INTERVAL '7 days' THEN 1 END) as eligible_for_conversion,
        COUNT(CASE WHEN s.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_subscriptions_30d
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
    `);

    const stats = userStats.rows[0];
    const usage = usageStats.rows[0];
    const subscriptions = subscriptionStats.rows[0];
    const conversion = conversionStats.rows[0];

    // Calculate key metrics
    const conversionRate = stats.total_users > 0 
      ? ((parseInt(subscriptions.active_subscriptions) / parseInt(stats.total_users)) * 100).toFixed(2)
      : '0.00';

    const revenue = {
      monthly: (parseInt(subscriptions.pro_subscriptions) * 97) + (parseInt(subscriptions.enterprise_subscriptions) * 997),
      annual: ((parseInt(subscriptions.pro_subscriptions) * 97) + (parseInt(subscriptions.enterprise_subscriptions) * 997)) * 12
    };

    res.json({
      success: true,
      dashboard: {
        overview: {
          totalUsers: parseInt(stats.total_users),
          activeSubscriptions: parseInt(subscriptions.active_subscriptions),
          monthlyRevenue: revenue.monthly,
          conversionRate: parseFloat(conversionRate)
        },
        users: {
          total: parseInt(stats.total_users),
          free: parseInt(stats.free_users),
          pro: parseInt(stats.pro_users),
          enterprise: parseInt(stats.enterprise_users),
          newUsers30d: parseInt(stats.new_users_30d),
          activeUsers7d: parseInt(stats.active_users_7d)
        },
        usage: {
          totalQueries: parseInt(usage.total_queries),
          oracleQueries: parseInt(usage.oracle_queries),
          sentinelQueries: parseInt(usage.sentinel_queries),
          sageQueries: parseInt(usage.sage_queries),
          queries24h: parseInt(usage.queries_24h),
          avgResponseTime: Math.round(parseFloat(usage.avg_response_time) || 0)
        },
        subscriptions: {
          total: parseInt(subscriptions.total_subscriptions),
          active: parseInt(subscriptions.active_subscriptions),
          trial: parseInt(subscriptions.trial_subscriptions),
          pro: parseInt(subscriptions.pro_subscriptions),
          enterprise: parseInt(subscriptions.enterprise_subscriptions)
        },
        revenue: {
          monthly: revenue.monthly,
          annual: revenue.annual,
          averagePerUser: stats.total_users > 0 ? Math.round(revenue.monthly / parseInt(stats.total_users)) : 0
        },
        trends: usageTrends.rows.map(row => ({
          date: row.date,
          queries: parseInt(row.queries),
          activeUsers: parseInt(row.active_users)
        }))
      }
    });
  })
);

// Get system health metrics
router.get('/health', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB();
    
    // Check database connectivity
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    try {
      const start = Date.now();
      await db.query('SELECT 1');
      dbResponseTime = Date.now() - start;
    } catch (error) {
      dbStatus = 'unhealthy';
      logger.error('Database health check failed', error);
    }

    // Check recent error rates
    const errorStats = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
        COUNT(*) as total
      FROM usage_logs 
      WHERE created_at >= NOW() - INTERVAL '1 hour'
    `);

    const errors = parseInt(errorStats.rows[0]?.errors || '0');
    const total = parseInt(errorStats.rows[0]?.total || '0');
    const errorRate = total > 0 ? ((errors / total) * 100).toFixed(2) : '0.00';

    res.json({
      success: true,
      health: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime
        },
        api: {
          errorRate: parseFloat(errorRate),
          totalRequests1h: total,
          errors1h: errors
        },
        timestamp: new Date().toISOString()
      }
    });
  })
);

// Get usage analytics
router.get('/analytics/usage',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const db = getDB();

    // Daily usage breakdown
    const dailyUsage = await db.query(`
      SELECT 
        DATE(created_at) as date,
        agent_type,
        COUNT(*) as queries,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(response_time_ms) as avg_response_time
      FROM usage_logs 
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at), agent_type
      ORDER BY date DESC, agent_type
    `);

    // Top users by usage
    const topUsers = await db.query(`
      SELECT 
        u.email,
        u.role,
        COUNT(ul.id) as total_queries,
        MAX(ul.created_at) as last_query
      FROM users u
      JOIN usage_logs ul ON u.id = ul.user_id
      WHERE ul.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY u.id, u.email, u.role
      ORDER BY total_queries DESC
      LIMIT 20
    `);

    // Usage by role
    const usageByRole = await db.query(`
      SELECT 
        u.role,
        COUNT(ul.id) as queries,
        COUNT(DISTINCT u.id) as users,
        AVG(ul.response_time_ms) as avg_response_time
      FROM users u
      JOIN usage_logs ul ON u.id = ul.user_id
      WHERE ul.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY u.role
      ORDER BY queries DESC
    `);

    res.json({
      success: true,
      analytics: {
        period: `${days} days`,
        dailyUsage: dailyUsage.rows.map(row => ({
          date: row.date,
          agent: row.agent_type,
          queries: parseInt(row.queries),
          uniqueUsers: parseInt(row.unique_users),
          avgResponseTime: Math.round(parseFloat(row.avg_response_time) || 0)
        })),
        topUsers: topUsers.rows.map(row => ({
          email: row.email,
          role: row.role,
          totalQueries: parseInt(row.total_queries),
          lastQuery: row.last_query
        })),
        usageByRole: usageByRole.rows.map(row => ({
          role: row.role,
          queries: parseInt(row.queries),
          users: parseInt(row.users),
          avgResponseTime: Math.round(parseFloat(row.avg_response_time) || 0),
          queriesPerUser: Math.round(parseInt(row.queries) / parseInt(row.users))
        }))
      }
    });
  })
);

// Audit log viewer
router.get('/audit-logs',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = (page - 1) * limit;
    
    const action = req.query.action as string;
    const userId = req.query.userId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const db = getDB();

    let query = `
      SELECT al.*, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (action) {
      query += ` AND al.action = $${paramIndex}`;
      queryParams.push(action);
      paramIndex++;
    }

    if (userId) {
      query += ` AND al.user_id = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND al.created_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND al.created_at <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await db.query(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM audit_logs WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (action) {
      countQuery += ` AND action = $${countParamIndex}`;
      countParams.push(action);
      countParamIndex++;
    }

    if (userId) {
      countQuery += ` AND user_id = $${countParamIndex}`;
      countParams.push(userId);
      countParamIndex++;
    }

    if (startDate) {
      countQuery += ` AND created_at >= $${countParamIndex}`;
      countParams.push(startDate);
      countParamIndex++;
    }

    if (endDate) {
      countQuery += ` AND created_at <= $${countParamIndex}`;
      countParams.push(endDate);
      countParamIndex++;
    }

    const countResult = await db.query(countQuery, countParams);
    const totalLogs = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      logs: result.rows.map(log => ({
        id: log.id,
        userId: log.user_id,
        userEmail: log.user_email,
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: log.created_at
      })),
      pagination: {
        page,
        limit,
        total: totalLogs,
        pages: Math.ceil(totalLogs / limit)
      }
    });
  })
);

export { router as adminRoutes };