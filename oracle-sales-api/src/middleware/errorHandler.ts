import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.body?.userId || req.query?.userId,
    statusCode: err.statusCode
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
  }

  if (err.name === 'UnauthorizedError' || err.message.includes('unauthorized')) {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Authentication required';
  }

  if (err.name === 'ForbiddenError' || err.message.includes('forbidden')) {
    statusCode = 403;
    code = 'FORBIDDEN';
    message = 'Access denied';
  }

  if (err.name === 'NotFoundError' || err.message.includes('not found')) {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Resource not found';
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  }

  if (err.code === '23503') {
    statusCode = 400;
    code = 'FOREIGN_KEY_VIOLATION';
    message = 'Referenced resource not found';
  }

  // Rate limiting errors
  if (err.message.includes('rate limit') || err.code === 'RATE_LIMIT_EXCEEDED') {
    statusCode = 429;
    code = 'RATE_LIMIT_EXCEEDED';
    message = 'Too many requests. Please try again later.';
  }

  // Stripe errors
  if (err.code && err.code.startsWith('stripe_')) {
    statusCode = 402;
    code = 'PAYMENT_ERROR';
    message = 'Payment processing failed';
  }

  const errorResponse = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    })
  };

  res.status(statusCode).json(errorResponse);
};

export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};