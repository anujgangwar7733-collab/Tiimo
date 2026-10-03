import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for Authentication endpoints to prevent brute-force attacks
 * Limits each IP to 20 requests per 15 minutes window
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP address. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * General rate limiter for standard API routes
 * Allows 200 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests created from this IP, please try again after 15 minutes.',
    code: 'API_RATE_LIMIT_EXCEEDED'
  }
});
