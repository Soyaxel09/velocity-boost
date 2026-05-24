class LoadShedder {
  constructor(options = {}) {
    this.maxEventLoopLag = options.maxEventLoopLag || 70; 
    this.checkInterval = options.lagCheckInterval || 500;
    this.currentLag = 0;
    this.isOverloaded = false;
    this._startMonitoring();
  }

  _startMonitoring() {
    let lastCheck = Date.now();
    setInterval(() => {
      const now = Date.now();
      this.currentLag = Math.max(0, now - lastCheck - this.checkInterval);
      this.isOverloaded = this.currentLag > this.maxEventLoopLag;
      lastCheck = now;
    }, this.checkInterval).unref();
  }

  middleware() {
    return (req, res, next) => {
      if (this.isOverloaded && !req.path.startsWith('/velocity')) {
        res.setHeader('Retry-After', '5');
        return res.status(503).json({
          status: false,
          message: "Servidor temporalmente sobrecargado. Reintentar en breve."
        });
      }
      next();
    };
  }

  getStats() {
    return {
      currentLagMs: this.currentLag,
      status: this.isOverloaded ? 'OVERLOADED' : 'HEALTHY',
      maxAllowedLagMs: this.maxEventLoopLag
    };
  }
}

export default LoadShedder;