import rateLimit from 'express-rate-limit';

class RateLimiter {
  constructor(options = {}) {
    this.options = options;
    this.requests = 0;
    this.blocked = 0;

    const windowMs = options.rateLimitWindow || 15 * 60 * 1000;
    const maxRequests = options.rateLimitMax || 1000;
    const strictMax = options.strictLimitMax || 100;
    const generousMax = options.generousLimitMax || 5000;

    this.limits = {
      global: rateLimit({
        windowMs,
        max: maxRequests,
        message: 'Demasiadas solicitudes desde esta IP. Intenta más tarde.',
        standardHeaders: true,
        legacyHeaders: false,
        skip: () => process.env.NODE_ENV === 'test',
      }),
      strict: rateLimit({
        windowMs,
        max: strictMax,
        message: 'Límite estricto excedido para este endpoint.',
        skipSuccessfulRequests: true,
      }),
      generous: rateLimit({
        windowMs,
        max: generousMax,
        skipSuccessfulRequests: false,
      }),
    };
  }

  middleware() {
    return this.limits.global;
  }

  strict() {
    return this.limits.strict;
  }

  generous() {
    return this.limits.generous;
  }

  recordRequest(blocked = false) {
    this.requests++;
    if (blocked) this.blocked++;
  }

  getStats() {
    return {
      totalRequests: this.requests,
      blockedRequests: this.blocked,
      blockPercentage: this.requests > 0 ? ((this.blocked / this.requests) * 100).toFixed(2) : 0,
    };
  }
}

export default RateLimiter;
