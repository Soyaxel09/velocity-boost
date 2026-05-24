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
  res.json({
    timestamp: new Date().toISOString(),
    message: 'Data from Vercel',
  });
});

app.get('/api/health', async (req, res) => {
  const health = await booster.getHealth();
  res.json(health);
});

export default app;
