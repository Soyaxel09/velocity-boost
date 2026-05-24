import express from 'express';
import VelocityBoost from '../src/index.js';

const app = express();

const booster = new VelocityBoost({
  enableCompression: true,
  enableCaching: true,
  enableRateLimit: true,
  enableMonitoring: true,
  maxMemory: 128 * 1024 * 1024,
  compressionLevel: 9,
  cacheTTL: 300,
  rateLimitMax: 1000,
});

booster.initializeMiddleware(app);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'Vercel Optimized API',
    region: process.env.VERCEL_REGION || 'local',
    environment: process.env.NODE_ENV,
  });
});

app.get('/api/data', (req, res) => {
  const cacheKey = booster.cache.generateKey(req);
  const cached = booster.cache.get(cacheKey);

  if (cached) return res.json({ ...cached, cached: true });

  const data = {
    timestamp: new Date().toISOString(),
    message: 'Data from Vercel',
  };

  booster.cache.set(cacheKey, data, 600);
  res.json(data);
});

app.get('/api/health', async (req, res) => {
  const health = await booster.getHealth();
  res.json(health);
});

export default app;
