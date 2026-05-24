import MemoryManager from './MemoryManager.js';
import CacheEngine from './CacheEngine.js';
import CompressionEngine from './CompressionEngine.js';
import RateLimiter from './RateLimiter.js';
import MonitoringSystem from './MonitoringSystem.js';
import optimizationMiddleware from '../middleware/optimizationMiddleware.js';

class PerformanceManager {
  constructor(options = {}) {
    this.options = {
      enableCompression: options.enableCompression !== false,
      enableCaching: options.enableCaching !== false,
      enableRateLimit: options.enableRateLimit !== false,
      enableMonitoring: options.enableMonitoring !== false,
      cacheType: options.cacheType || 'memory',
      maxMemory: options.maxMemory || 512 * 1024 * 1024,
      cacheTTL: options.cacheTTL || 3600,
      compressionLevel: options.compressionLevel || 9,
      compressionThreshold: options.compressionThreshold || 1024,
      rateLimitWindow: options.rateLimitWindow || 15 * 60 * 1000,
      rateLimitMax: options.rateLimitMax || 1000,
      strictLimitMax: options.strictLimitMax || 100,
      generousLimitMax: options.generousLimitMax || 5000,
      ...options,
    };

    this.memory = new MemoryManager(this.options);
    this.cache = new CacheEngine(this.options);
    this.compression = new CompressionEngine(this.options);
    this.rateLimit = new RateLimiter(this.options);
    this.monitoring = new MonitoringSystem(this.options);
  }

  initializeMiddleware(app) {
    if (this.options.enableMonitoring) {
      app.use(this.monitoring.middleware());
    }

    if (this.options.enableCompression) {
      app.use(this.compression.middleware());
    }

    if (this.options.enableRateLimit) {
      app.use(this.rateLimit.middleware());
    }

    app.use(optimizationMiddleware.middleware());

    return app;
  }

  async getStats() {
    return {
      memory: this.memory.getStats(),
      cache: this.cache.getStats(),
      compression: this.compression.getStats(),
      rateLimit: this.rateLimit.getStats(),
      monitoring: this.monitoring.getStats(),
      timestamp: new Date().toISOString(),
    };
  }

  async getHealth() {
    const stats = await this.getStats();
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const heapPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const status =
      heapPercentage > 90
        ? 'critical'
        : heapPercentage > 80
          ? 'warning'
          : 'healthy';

    return {
      status,
      uptime: this.formatUptime(uptime),
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapPercentage: `${heapPercentage.toFixed(2)}%`,
      },
      stats,
    };
  }

  async clearCache() {
    return this.cache.clear();
  }

  forceGC() {
    if (global.gc) {
      global.gc();
      return { message: '✅ Garbage Collection ejecutado exitosamente' };
    }
    return {
      message: '⚠️ GC no disponible. Ejecuta: node --expose-gc app.js',
    };
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days} días, ${hours} horas`;
    if (hours > 0) return `${hours} horas, ${minutes} minutos`;
    return `${minutes} minutos`;
  }
}

export default PerformanceManager;
