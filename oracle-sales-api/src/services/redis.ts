import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};

export const getRedis = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

// Utility functions for common Redis operations
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
};

export const cacheSet = async (
  key: string, 
  value: string, 
  ttlSeconds?: number
): Promise<boolean> => {
  try {
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (error) {
    logger.error(`Redis SET error for key ${key}:`, error);
    return false;
  }
};

export const cacheDel = async (key: string): Promise<boolean> => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error(`Redis DEL error for key ${key}:`, error);
    return false;
  }
};

// Usage tracking functions
export const incrementDailyUsage = async (
  userId: string, 
  agentType: string
): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${agentType}:${today}`;
  
  try {
    const count = await redisClient.incr(key);
    // Set expiry for usage keys (keep for 30 days)
    await redisClient.expire(key, 30 * 24 * 60 * 60);
    return count;
  } catch (error) {
    logger.error(`Error incrementing usage for ${key}:`, error);
    return 0;
  }
};

export const getDailyUsage = async (
  userId: string, 
  agentType: string, 
  date?: string
): Promise<number> => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${agentType}:${targetDate}`;
  
  try {
    const count = await redisClient.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    logger.error(`Error getting usage for ${key}:`, error);
    return 0;
  }
};

// Session management
export const setSession = async (
  sessionId: string, 
  userId: string, 
  ttlSeconds: number = 24 * 60 * 60 // 24 hours
): Promise<boolean> => {
  return await cacheSet(`session:${sessionId}`, userId, ttlSeconds);
};

export const getSession = async (sessionId: string): Promise<string | null> => {
  return await cacheGet(`session:${sessionId}`);
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
  return await cacheDel(`session:${sessionId}`);
};

// Rate limiting helpers
export const isRateLimited = async (
  identifier: string, 
  limit: number, 
  windowSeconds: number
): Promise<boolean> => {
  const key = `rate_limit:${identifier}`;
  
  try {
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, windowSeconds);
    }
    
    return current > limit;
  } catch (error) {
    logger.error(`Rate limiting error for ${identifier}:`, error);
    return false; // Fail open
  }
};