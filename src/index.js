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
    this.initializeRoutes(app);
    return app;
  }

  initializeRoutes(app) {
    const auth = this.options.adminMiddleware || ((req, res, next) => next());

    app.use('/velocity', auth);

    app.get('/velocity/dashboard', (req, res) => {
      res.sendFile(this.getDashboardPath());
    });

    app.get('/velocity/health', async (req, res) => {
      res.json(await this.getHealth());
    });

    app.get('/velocity/stats', async (req, res) => {
      res.json(await this.getStats());
    });

    app.get('/velocity/metrics', (req, res) => {
      const limit = parseInt(req.query.limit) || 50;
      res.json({ limit, count: this.monitoring.metrics.length, metrics: this.monitoring.getRecentMetrics(limit) });
    });

    app.post('/velocity/cache/clear', async (req, res) => {
      const result = await this.clearCache();
      res.json({ message: 'Cache limpiado', cleared: result.cleared, type: result.type });
    });

    app.post('/velocity/gc', (req, res) => {
      res.json(this.forceGC());
    });

    return app;
  }
}

export default VelocityBoost;
