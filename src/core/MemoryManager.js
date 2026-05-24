class RequestTracker {
  constructor(options = {}) {
    this.options = options;
    this.startTime = Date.now();
    this.requests = 0;
    this.errors = 0;
    this.totalResponseTime = 0;
    this.slowRequests = 0;
  }

  getStats() {
    const memUsage = process.memoryUsage();
    const uptime = (Date.now() - this.startTime) / 1000;
    const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    return {
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      externalMB: Math.round(memUsage.external / 1024 / 1024),
      rssMB: Math.round(memUsage.rss / 1024 / 1024),
      heapPercentage: heapPercentage.toFixed(2),
      uptime: Math.floor(uptime),
      requests: this.requests,
      errors: this.errors,
      avgResponseTime: this.requests > 0 ? Math.round(this.totalResponseTime / this.requests) : 0,
      slowRequests: this.slowRequests,
    };
  }

  recordRequest(responseTime, error = false) {
    this.requests++;
    this.totalResponseTime += responseTime;
    if (error) this.errors++;
    if (responseTime > 1000) this.slowRequests++;
  }

  forceGC() {
    if (global.gc) {
      global.gc();
      return { message: '✅ Garbage Collection ejecutado' };
    }
    return { message: '⚠️ GC no disponible' };
  }
}

export default RequestTracker;
