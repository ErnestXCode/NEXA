// /middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

/**
 * General authentication rate limiter
 * Protects login, register, and password endpoints from brute-force attacks.
 */

const authLimiter = rateLimit({
  // Time window for rate limiting
  windowMs: 60 * 60 * 1000, // 1 hour

  // Maximum number of requests allowed per IP within the time window
  max: process.env.NODE_ENV !== "dev" ? 3 : 1000, // Higher limit for dev mode

  // Message returned when limit is exceeded
  message: {
    status: 429,
    msg:
      "Too many attempts from this IP. Please try again after 1 hour.",
  },

  // Include helpful rate limit headers in responses
  standardHeaders: true, // Sends RateLimit-* headers
  legacyHeaders: false, // Disables the old X-RateLimit-* headers

  // Optional: custom handler for logging or monitoring
  handler: (req, res, next, options) => {
    console.warn(
      `⚠️ Rate limit hit: ${req.ip} on ${req.originalUrl} at ${new Date().toISOString()}`
    );
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = authLimiter;
