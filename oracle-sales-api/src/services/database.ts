import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool;

export const connectDatabase = async (): Promise<void> => {
  try {
    const connectionString = process.env.DATABASE_URL || 
      'postgresql://flexabrain:flexabrain_secure_2024@localhost:5432/flexabrain';

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const getDB = (): Pool => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
};

// Helper function for transactions
export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Database initialization scripts
export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('Initializing database schema...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        company VARCHAR(255),
        role VARCHAR(20) DEFAULT 'free' CHECK (role IN ('free', 'pro', 'enterprise', 'admin')),
        subscription_id VARCHAR(255),
        subscription_status VARCHAR(50),
        trial_ends_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // Create usage tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        agent_type VARCHAR(50) NOT NULL, -- 'oracle', 'sentinel', 'sage'
        query_text TEXT,
        tokens_used INTEGER DEFAULT 0,
        response_time_ms INTEGER,
        status VARCHAR(20) DEFAULT 'success',
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX idx_user_date (user_id, DATE(created_at)),
        INDEX idx_agent_date (agent_type, DATE(created_at))
      );
    `);

    // Create subscriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        stripe_subscription_id VARCHAR(255) UNIQUE,
        stripe_customer_id VARCHAR(255),
        plan VARCHAR(50) NOT NULL, -- 'pro', 'enterprise'
        status VARCHAR(50) NOT NULL,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create audit logs table for enterprise compliance
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(255),
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX idx_user_action (user_id, action),
        INDEX idx_resource (resource_type, resource_id),
        INDEX idx_created_at (created_at)
      );
    `);

    logger.info('✅ Database schema initialized successfully');
  } catch (error) {
    logger.error('❌ Database schema initialization failed:', error);
    throw error;
  }
};