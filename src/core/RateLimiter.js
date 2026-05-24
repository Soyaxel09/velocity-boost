import rateLimit from 'express-rate-limit';

class RateLimiter {
  constructor(options = {}) {
    this.requests = 0;
    this.blocked = 0;

    const windowMs = options.rateLimitWindow || 15 * 60 * 1000;

    const handler = (req, res) => {
      this.blocked++;
      res.status(429).json({ status: false, message: 'Demasiadas solicitudes. Intenta más tarde.' });
    };

    this.limits = {
      global: rateLimit({ windowMs, max: options.rateLimitMax || 1000, handler, standardHeaders: true, legacyHeaders: false }),
      strict: rateLimit({ windowMs, max: options.strictLimitMax || 100, handler }),
      generous: rateLimit({ windowMs, max: options.generousLimitMax || 5000, handler }),
    };
  }

  _wrap(limiter) {
    return (req, res, next) => {
      this.requests++;
      limiter(req, res, next);
    };
  }

  middleware() { return this._wrap(this.limits.global); }
  strict() { return this._wrap(this.limits.strict); }
  generous() { return this._wrap(this.limits.generous); }

  getStats() {
    return {
      totalRequests: this.requests,
      blockedRequests: this.blocked,
      blockPercentage: this.requests > 0 ? ((this.blocked / this.requests) * 100).toFixed(2) : '0.00',
    };
  }
}

export default RateLimiter;
