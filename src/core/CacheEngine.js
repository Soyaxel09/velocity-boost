import crypto from 'crypto';

class CacheEngine {
  constructor(options = {}) {
    this.options = options;
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
    this.maxSize = options.cacheMaxSize || 10000;
    this.defaultTTL = options.cacheTTL || 3600;
  }

  generateKey(req) {
    const key = `${req.method}:${req.originalUrl}`;
    return crypto.createHash('sha256').update(key).digest('hex').substring(0, 16);
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      this.misses++;
      return null;
    }

    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.value;
  }

  set(key, value, ttl = null) {
    const finalTTL = ttl || this.defaultTTL;

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + finalTTL * 1000,
      created: Date.now(),
    });
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    return { cleared: size };
  }

  skipCache() {
    return (req, res, next) => {
      res.skipCache = true;
      next();
    };
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      entries: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(2) : '0.00',
      totalRequests: total,
      maxSize: this.maxSize,
    };
  }
}

export default CacheEngine;
