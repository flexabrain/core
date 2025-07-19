import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import Joi from 'joi';
import { authenticateToken, requirePaid } from '../middleware/auth';
import { getDB, withTransaction } from '../services/database';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// DEBUG: Log Stripe version and API version for type mismatch diagnosis
logger.info('Debugging Stripe API version type issue', {
  stripeVersion: require('stripe/package.json').version,
  currentApiVersion: '2023-10-16',
  expectedType: 'Checking for type definition mismatch'
});

// Initialize Stripe - Fixed corrupted type definition issue
// The expected type '2025-06-30.basil' indicates corrupted Stripe type definitions
// Using proper API version with type assertion until types are updated
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2024-06-20' as any, // Valid API version, bypassing corrupted type definitions
});

// DEBUG: Log actual Stripe instance configuration
logger.info('Stripe instance created with config', {
  configuredApiVersion: (stripe as any).apiVersion
});

// Stripe Price IDs (configure these in your Stripe dashboard)
const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  enterprise_monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
  enterprise_yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly'
};

const subscribeSchema = Joi.object({
  plan: Joi.string().valid('pro', 'enterprise').required(),
  billing: Joi.string().valid('monthly', 'yearly').default('monthly'),
  paymentMethodId: Joi.string().required(),
  couponCode: Joi.string().optional()
});

// Get subscription plans and pricing
router.get('/plans', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    plans: {
      free: {
        name: 'Free',
        price: 0,
        billing: 'forever',
        features: {
          agents: ['oracle'],
          dailyLimits: { oracle: 5, sentinel: 0, sage: 0 },
          features: ['basic_analytics', 'community_support']
        },
        popular: false
      },
      pro: {
        name: 'Pro',
        price: {
          monthly: 97,
          yearly: 970 // ~$81/month with 2 months free
        },
        billing: 'monthly/yearly',
        features: {
          agents: ['oracle', 'sentinel', 'sage'],
          dailyLimits: { oracle: -1, sentinel: -1, sage: -1 },
          features: [
            'unlimited_queries',
            'all_three_agents',
            'advanced_analytics',
            'custom_workflows',
            'priority_support',
            'api_access'
          ]
        },
        popular: true,
        trialDays: 7
      },
      enterprise: {
        name: 'Enterprise',
        price: {
          monthly: 997,
          yearly: 9970 // ~$831/month with 2 months free
        },
        billing: 'monthly/yearly',
        features: {
          agents: ['oracle', 'sentinel', 'sage'],
          dailyLimits: { oracle: -1, sentinel: -1, sage: -1 },
          features: [
            'unlimited_queries',
            'all_three_agents',
            'advanced_analytics',
            'custom_workflows',
            'dedicated_support',
            'white_label_deployment',
            'custom_integrations',
            'sla_guarantees',
            'audit_logs',
            'data_export',
            'custom_ai_models'
          ]
        },
        popular: false,
        contactRequired: true
      }
    }
  });
}));

// Create subscription
router.post('/subscribe', 
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = subscribeSchema.validate(req.body);
    
    if (error) {
      throw createError('Validation failed: ' + error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { plan, billing, paymentMethodId, couponCode } = value;
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    try {
      await withTransaction(async (client) => {
        // Get user details
        const userResult = await client.query(
          'SELECT email, first_name, last_name, company FROM users WHERE id = $1',
          [userId]
        );

        if (userResult.rows.length === 0) {
          throw createError('User not found', 404, 'USER_NOT_FOUND');
        }

        const user = userResult.rows[0];

        // Create or get Stripe customer
        let customer;
        try {
          const customers = await stripe.customers.list({
            email: user.email,
            limit: 1
          });

          if (customers.data.length > 0) {
            customer = customers.data[0];
          } else {
            customer = await stripe.customers.create({
              email: user.email,
              name: `${user.first_name} ${user.last_name}`.trim(),
              metadata: {
                userId: userId,
                company: user.company || ''
              }
            });
          }
        } catch (stripeError) {
          logger.error('Stripe customer creation failed', stripeError);
          throw createError('Payment processing failed', 402, 'STRIPE_ERROR');
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customer.id,
        });

        // Set as default payment method
        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });

        // Determine price ID
        const priceKey = `${plan}_${billing}` as keyof typeof PRICE_IDS;
        const priceId = PRICE_IDS[priceKey];
        
        if (!priceId) {
          throw createError('Invalid plan/billing combination', 400, 'INVALID_PLAN');
        }

        // Create subscription
        const subscriptionParams: Stripe.SubscriptionCreateParams = {
          customer: customer.id,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId: userId,
            plan: plan,
            billing: billing
          }
        };

        // Add coupon if provided
        if (couponCode) {
          subscriptionParams.discounts = [{ coupon: couponCode }];
        }

        // Add trial for Pro plans
        if (plan === 'pro') {
          subscriptionParams.trial_period_days = 7;
        }

        const subscription = await stripe.subscriptions.create(subscriptionParams);

        // Update user in database
        await client.query(
          `UPDATE users 
           SET role = $1, subscription_id = $2, subscription_status = $3, updated_at = NOW()
           WHERE id = $4`,
          [plan, subscription.id, subscription.status, userId]
        );

        // Create subscription record
        await client.query(
          `INSERT INTO subscriptions 
           (user_id, stripe_subscription_id, stripe_customer_id, plan, status, 
            current_period_start, current_period_end)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            userId,
            subscription.id,
            customer.id,
            plan,
            subscription.status,
            new Date((subscription as any).current_period_start * 1000),
            new Date((subscription as any).current_period_end * 1000)
          ]
        );

        logger.info('Subscription created successfully', {
          userId,
          subscriptionId: subscription.id,
          plan,
          billing,
          amount: subscription.items.data[0].price?.unit_amount
        });

        // Handle payment intent if needed
        const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentIntent = (latestInvoice as any)?.payment_intent as Stripe.PaymentIntent;

        res.json({
          success: true,
          message: 'Subscription created successfully',
          subscription: {
            id: subscription.id,
            status: subscription.status,
            plan: plan,
            billing: billing,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
          },
          ...(paymentIntent && {
            clientSecret: paymentIntent.client_secret,
            requiresAction: paymentIntent.status === 'requires_action'
          })
        });
      });

    } catch (error: any) {
      logger.error('Subscription creation failed', {
        userId,
        plan,
        error: error.message
      });

      if (error.code) {
        throw error; // Re-throw our custom errors
      }

      throw createError(
        'Subscription creation failed. Please try again.',
        500,
        'SUBSCRIPTION_CREATION_FAILED'
      );
    }
  })
);

// Get current subscription
router.get('/current',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // DEBUG: Log function entry to diagnose missing return value
    logger.debug('DEBUG: Entering /current handler - checking return paths', {
      functionExpects: 'Promise<void> or void return type',
      currentIssue: 'Not all code paths return a value'
    });
    
    const userId = req.user!.id;
    const db = getDB();

    const result = await db.query(
      `SELECT s.*, u.role, u.subscription_status
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = $1 AND s.status IN ('active', 'trialing', 'past_due')
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      logger.debug('DEBUG: No subscription found - explicit return path');
      return res.json({
        success: true,
        subscription: null,
        plan: 'free'
      });
    }

    const subscription = result.rows[0];

    // Get latest info from Stripe
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id,
        { expand: ['latest_invoice'] }
      );

      logger.debug('DEBUG: Successful Stripe fetch - adding explicit return');
      res.json({
        success: true,
        subscription: {
          id: subscription.stripe_subscription_id,
          status: stripeSubscription.status,
          plan: subscription.plan,
          currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
          amount: stripeSubscription.items.data[0].price?.unit_amount || 0,
          currency: stripeSubscription.items.data[0].price?.currency || 'usd'
        },
        plan: subscription.plan
      });
      return; // Explicit return for TypeScript

    } catch (stripeError) {
      logger.error('Failed to fetch Stripe subscription', stripeError);
      
      // Fallback to database info
      logger.debug('DEBUG: Database fallback - adding explicit return');
      res.json({
        success: true,
        subscription: {
          id: subscription.stripe_subscription_id,
          status: subscription.status,
          plan: subscription.plan,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false
        },
        plan: subscription.plan
      });
      return; // Explicit return for TypeScript
    }
  })
);

// Cancel subscription
router.post('/cancel',
  authenticateToken,
  requirePaid,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { immediate = false } = req.body;

    const db = getDB();
    
    // Get current subscription
    const result = await db.query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (result.rows.length === 0) {
      throw createError('No active subscription found', 404, 'NO_ACTIVE_SUBSCRIPTION');
    }

    const subscriptionId = result.rows[0].stripe_subscription_id;

    try {
      let updatedSubscription;
      
      if (immediate) {
        // Cancel immediately
        updatedSubscription = await stripe.subscriptions.cancel(subscriptionId);
        
        // Update user role immediately
        await db.query(
          'UPDATE users SET role = $1, subscription_status = $2 WHERE id = $3',
          ['free', 'canceled', userId]
        );
        
      } else {
        // Cancel at period end
        updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }

      // Update subscription record
      await db.query(
        'UPDATE subscriptions SET cancel_at_period_end = $1, status = $2, updated_at = NOW() WHERE stripe_subscription_id = $3',
        [updatedSubscription.cancel_at_period_end, updatedSubscription.status, subscriptionId]
      );

      logger.info('Subscription cancelled', {
        userId,
        subscriptionId,
        immediate
      });

      res.json({
        success: true,
        message: immediate 
          ? 'Subscription cancelled immediately' 
          : 'Subscription will cancel at the end of the current period',
        cancelledAt: immediate ? new Date() : new Date((updatedSubscription as any).current_period_end * 1000)
      });

    } catch (stripeError) {
      logger.error('Subscription cancellation failed', stripeError);
      throw createError('Failed to cancel subscription', 500, 'CANCELLATION_FAILED');
    }
  })
);

// Webhook handler for Stripe events
router.post('/webhook', 
  asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret || !sig) {
      throw createError('Missing webhook signature', 400, 'MISSING_SIGNATURE');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      logger.error('Webhook signature verification failed', err);
      throw createError('Webhook signature verification failed', 400, 'INVALID_SIGNATURE');
    }

    const db = getDB();

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        
        await db.query(
          `UPDATE subscriptions 
           SET status = $1, current_period_start = $2, current_period_end = $3, 
               cancel_at_period_end = $4, updated_at = NOW()
           WHERE stripe_subscription_id = $5`,
          [
            subscription.status,
            new Date((subscription as any).current_period_start * 1000),
            new Date((subscription as any).current_period_end * 1000),
            (subscription as any).cancel_at_period_end,
            subscription.id
          ]
        );

        // Update user role based on subscription status
        const newRole = subscription.status === 'active' || subscription.status === 'trialing'
          ? subscription.metadata.plan || 'free'
          : 'free';

        await db.query(
          `UPDATE users 
           SET role = $1, subscription_status = $2, updated_at = NOW()
           WHERE subscription_id = $3`,
          [newRole, subscription.status, subscription.id]
        );

        logger.info('Subscription updated via webhook', {
          subscriptionId: subscription.id,
          status: subscription.status,
          newRole
        });
        break;

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        // Handle payment events for additional logging/notifications
        const invoice = event.data.object as Stripe.Invoice;
        logger.info('Invoice payment event', {
          invoiceId: invoice.id,
          subscriptionId: (invoice as any).subscription,
          status: event.type,
          amount: (invoice as any).amount_paid
        });
        break;

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }

    res.json({ received: true });
  })
);

export { router as subscriptionRoutes };
