import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress || '';

  // Log incoming request
  logger.info('Incoming request', {
    method,
    url,
    ip,
    userAgent: userAgent.substring(0, 200), // Limit user agent length
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any): Response {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log response
    logger.info('Request completed', {
      method,
      url,
      statusCode,
      responseTime,
      ip,
      contentLength: res.get('content-length') || 0
    });

    // Call original end method
    return originalEnd(chunk, encoding);
  };

  next();
};

// Enhanced request logger with more details for audit purposes
export const auditLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  const referer = req.get('Referer') || '';
  
  // Extract user ID from JWT token if available
  const userId = (req as any).user?.id || null;

  // Log detailed audit information
  logger.info('Audit log', {
    type: 'request_start',
    method,
    url,
    ip,
    userAgent,
    referer,
    userId,
    timestamp: new Date().toISOString(),
    headers: {
      authorization: req.get('authorization') ? 'Bearer [REDACTED]' : undefined,
      'content-type': req.get('content-type'),
      'content-length': req.get('content-length')
    }
  });

  // Override res.end for audit logging
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any): Response {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    logger.info('Audit log', {
      type: 'request_complete',
      method,
      url,
      statusCode,
      responseTime,
      ip,
      userId,
      contentLength: res.get('content-length') || 0,
      timestamp: new Date().toISOString()
    });

    return originalEnd(chunk, encoding);
  };

  next();
};