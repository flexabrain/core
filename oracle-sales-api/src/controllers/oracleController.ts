import { Router, Request, Response } from 'express';
import axios from 'axios';
import Joi from 'joi';
import { authenticateToken, requireAgentAccess, checkUsageLimit } from '../middleware/auth';
import { getDB } from '../services/database';
import { incrementDailyUsage, getDailyUsage } from '../services/redis';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { ROLE_PERMISSIONS } from '../models/User';

const router = Router();

// Oracle query validation schema
const oracleQuerySchema = Joi.object({
  query: Joi.string().min(1).max(2000).required(),
  context: Joi.object({
    industry: Joi.string().max(100),
    company: Joi.string().max(200),
    revenue: Joi.number().positive(),
    employees: Joi.number().positive()
  }).optional(),
  options: Joi.object({
    temperature: Joi.number().min(0).max(1).default(0.7),
    maxTokens: Joi.number().min(50).max(2000).default(500),
    includeRecommendations: Joi.boolean().default(true)
  }).optional()
});

// Oracle Sales Intelligence Query
router.post('/query', 
  authenticateToken, 
  requireAgentAccess('oracle'),
  checkUsageLimit('oracle'),
  asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = oracleQuerySchema.validate(req.body);
    
    if (error) {
      throw createError('Invalid query: ' + error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { query, context, options } = value;
    const userId = req.user!.id;
    const userRole = req.user!.role as keyof typeof ROLE_PERMISSIONS;
    const usageInfo = (req as any).usageInfo;

    const startTime = Date.now();

    try {
      // Build enhanced prompt for Oracle Sales Intelligence
      const enhancedPrompt = buildOraclePrompt(query, context, req.user!.role);

      // Call Ollama API
      const ollamaResponse = await callOllama(enhancedPrompt, options);
      
      const responseTime = Date.now() - startTime;

      // Increment usage counter
      const newUsageCount = await incrementDailyUsage(userId, 'oracle');

      // Log usage to database for analytics
      await logUsage(userId, 'oracle', query, ollamaResponse.tokens_used || 0, responseTime, 'success');

      // Prepare response with conversion optimization
      const response = {
        success: true,
        query,
        response: ollamaResponse.response,
        metadata: {
          responseTime,
          tokensUsed: ollamaResponse.tokens_used || 0,
          model: 'mistral:7b-instruct',
          timestamp: new Date().toISOString()
        },
        usage: {
          current: newUsageCount,
          limit: ROLE_PERMISSIONS[userRole].dailyLimits.oracle,
          remaining: ROLE_PERMISSIONS[userRole].dailyLimits.oracle === -1 
            ? 'unlimited' 
            : Math.max(0, ROLE_PERMISSIONS[userRole].dailyLimits.oracle - newUsageCount)
        }
      };

      // Add conversion prompts for free users approaching limits
      if (userRole === 'free') {
        const remaining = ROLE_PERMISSIONS[userRole].dailyLimits.oracle - newUsageCount;
        
        if (remaining <= 1) {
          (response as any).conversionPrompt = {
            message: "You're almost at your daily limit! Upgrade to Pro for unlimited Oracle queries.",
            urgency: 'high',
            ctaText: 'Upgrade to Pro - $97/month',
            benefits: [
              'Unlimited Oracle, Sentinel & Sage agents',
              'Advanced analytics & workflows',
              'Priority support',
              'Custom integrations'
            ],
            upgradeUrl: '/api/subscriptions/upgrade',
            trialAvailable: true
          };
        } else if (remaining <= 2) {
          (response as any).conversionPrompt = {
            message: `Only ${remaining} queries left today. Upgrade for unlimited access!`,
            urgency: 'medium',
            ctaText: 'Start Pro Trial',
            upgradeUrl: '/api/subscriptions/upgrade'
          };
        }
      }

      // Add recommendations for better queries (engagement strategy)
      if (options?.includeRecommendations) {
        (response as any).recommendations = generateQueryRecommendations(query, context);
      }

      logger.info('Oracle query processed successfully', {
        userId,
        userRole,
        queryLength: query.length,
        responseTime,
        tokensUsed: ollamaResponse.tokens_used,
        usage: newUsageCount
      });

      res.json(response);

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Log failed usage
      await logUsage(userId, 'oracle', query, 0, responseTime, 'error');

      logger.error('Oracle query failed', {
        userId,
        error: error.message,
        responseTime,
        query: query.substring(0, 100) // Log first 100 chars only
      });

      throw createError(
        'Oracle query processing failed. Please try again.',
        500,
        'ORACLE_PROCESSING_ERROR',
        { responseTime }
      );
    }
  })
);

// Get usage analytics for current user
router.get('/usage', 
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role as keyof typeof ROLE_PERMISSIONS;

    // Get current daily usage
    const dailyUsage = await getDailyUsage(userId, 'oracle');
    const dailyLimit = ROLE_PERMISSIONS[userRole].dailyLimits.oracle;

    // Get usage history from database
    const db = getDB();
    const usageHistory = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as queries, 
              AVG(response_time_ms) as avg_response_time,
              SUM(tokens_used) as total_tokens
       FROM usage_logs 
       WHERE user_id = $1 AND agent_type = 'oracle' AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [userId]
    );

    res.json({
      success: true,
      usage: {
        today: {
          used: dailyUsage,
          limit: dailyLimit,
          remaining: dailyLimit === -1 ? 'unlimited' : Math.max(0, dailyLimit - dailyUsage),
          percentUsed: dailyLimit === -1 ? 0 : Math.min(100, (dailyUsage / dailyLimit) * 100)
        },
        history: usageHistory.rows.map(row => ({
          date: row.date,
          queries: parseInt(row.queries),
          avgResponseTime: Math.round(row.avg_response_time || 0),
          totalTokens: parseInt(row.total_tokens || 0)
        }))
      },
      limits: {
        oracle: dailyLimit,
        upgradeRequired: dailyLimit !== -1
      }
    });
  })
);

// Get Oracle capabilities and pricing info
router.get('/info', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    agent: {
      name: 'Oracle Sales Agent',
      role: 'The Predictor',
      specialization: 'Predictive analytics and forecasting',
      model: 'mistral:7b-instruct',
      capabilities: [
        'Revenue forecasting with 87% accuracy',
        'Real-time deal risk assessment',
        'Competitive analysis automation',
        'Sales workflow orchestration',
        'Lead qualification and scoring',
        'Market trend analysis'
      ],
      useCases: [
        'Sales forecasting',
        'Trend analysis', 
        'Risk assessment',
        'Demand prediction',
        'Competitive intelligence',
        'Pipeline optimization'
      ]
    },
    pricing: {
      free: {
        price: '$0',
        queries: '5 per day',
        features: ['Basic sales intelligence', 'Community support']
      },
      pro: {
        price: '$97/month',
        queries: 'Unlimited',
        features: [
          'All three agents unlimited',
          'Advanced workflows',
          'Priority support',
          'Custom integrations'
        ]
      },
      enterprise: {
        price: '$997/month',
        queries: 'Unlimited',
        features: [
          'White-label deployment',
          'Custom AI models',
          'Dedicated support',
          'SLA guarantees'
        ]
      }
    }
  });
}));

// Helper functions

function buildOraclePrompt(query: string, context?: any, userRole?: string): string {
  let prompt = `You are Oracle, the FlexaBrain Sales Intelligence Agent. You are "The Predictor" - specializing in predictive analytics and sales forecasting.

Your expertise includes:
- Revenue forecasting with 87% accuracy
- Deal risk assessment and scoring
- Competitive analysis and market intelligence
- Sales process optimization
- Lead qualification and pipeline management

`;

  if (context) {
    prompt += `Business Context:
${context.industry ? `Industry: ${context.industry}` : ''}
${context.company ? `Company: ${context.company}` : ''}
${context.revenue ? `Revenue: $${context.revenue.toLocaleString()}` : ''}
${context.employees ? `Employees: ${context.employees}` : ''}

`;
  }

  prompt += `User Query: ${query}

Provide a detailed, actionable response with specific insights and recommendations. Include data-driven predictions where possible.`;

  // Add role-specific enhancements
  if (userRole === 'free') {
    prompt += `\n\nNote: Provide a comprehensive but concise response suitable for evaluation purposes.`;
  }

  return prompt;
}

async function callOllama(prompt: string, options?: any): Promise<any> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  try {
    const response = await axios.post(`${ollamaUrl}/api/generate`, {
      model: 'mistral:7b-instruct',
      prompt: prompt,
      stream: false,
      options: {
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 500,
        top_p: 0.9
      }
    }, {
      timeout: 30000 // 30 second timeout
    });

    return {
      response: response.data.response,
      tokens_used: response.data.eval_count || 0
    };
  } catch (error: any) {
    logger.error('Ollama API call failed', {
      error: error.message,
      url: ollamaUrl,
      model: 'mistral:7b-instruct'
    });
    
    throw createError(
      'AI processing service temporarily unavailable',
      503,
      'OLLAMA_UNAVAILABLE'
    );
  }
}

async function logUsage(
  userId: string, 
  agentType: string, 
  query: string, 
  tokensUsed: number, 
  responseTime: number, 
  status: string
): Promise<void> {
  try {
    const db = getDB();
    await db.query(
      `INSERT INTO usage_logs (user_id, agent_type, query_text, tokens_used, response_time_ms, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, agentType, query, tokensUsed, responseTime, status]
    );
  } catch (error) {
    logger.error('Failed to log usage', error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

function generateQueryRecommendations(query: string, context?: any): any[] {
  // Smart recommendations based on query content
  const recommendations = [];

  if (query.toLowerCase().includes('forecast') || query.toLowerCase().includes('predict')) {
    recommendations.push({
      title: 'Enhance Forecasting Accuracy',
      suggestion: 'Include historical data timeframe for more accurate predictions',
      example: 'Add "using Q1-Q3 data" to your query'
    });
  }

  if (query.toLowerCase().includes('competitor')) {
    recommendations.push({
      title: 'Competitive Analysis',
      suggestion: 'Try asking about specific competitors or market segments',
      example: '"Compare against [competitor] in [market segment]"'
    });
  }

  if (!context || !context.industry) {
    recommendations.push({
      title: 'Industry Context',
      suggestion: 'Add industry context for more relevant insights',
      example: 'Include your industry in the query context'
    });
  }

  // Always suggest trying other agents for Pro users
  recommendations.push({
    title: 'Explore Other Agents',
    suggestion: 'Complement with Sentinel (monitoring) or Sage (analytics)',
    upgradeRequired: true
  });

  return recommendations.slice(0, 3); // Limit to 3 recommendations
}

export { router as oracleRoutes };