import PerformanceManager from './core/PerformanceManager.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class VelocityBoost extends PerformanceManager {
  constructor(options = {}) {
    super(options);
    this.__dirname = dirname(dirname(__filename));
  }

  getDashboardPath() {
    return `${this.__dirname}/public/dashboard.html`;
  }

  initializeMiddleware(app) {
    super.initializeMiddleware(app);

    app.get('/velocity/dashboard', (req, res) => {
      res.sendFile(this.getDashboardPath());
    });

    app.get('/velocity/health', async (req, res) => {
      const health = await this.getHealth();
      res.json(health);
    });

    app.get('/velocity/stats', async (req, res) => {
      const stats = await this.getStats();
      res.json(stats);
    });

    app.get('/velocity/metrics', (req, res) => {
      const limit = parseInt(req.query.limit) || 50;
      const metrics = this.monitoring.getRecentMetrics(limit);
      res.json({
        limit,
        count: metrics.length,
        metrics,
      });
    });

    app.post('/velocity/cache/clear', async (req, res) => {
      const result = await this.clearCache();
      res.json({
        message: 'Cache limpiado exitosamente',
        cleared: result.cleared,
      });
    });

    app.post('/velocity/gc', (req, res) => {
      const result = this.forceGC();
      res.json(result);
    });

    return app;
  }
}

export default VelocityBoost;
