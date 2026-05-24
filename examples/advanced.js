import express from 'express';
import VelocityBoost from '../src/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const booster = new VelocityBoost({
  enableCompression: true,
  enableCaching: true,
  enableRateLimit: true,
  enableMonitoring: true,
  cacheTTL: 300,
  compressionLevel: 9,
  rateLimitMax: 2000,
});

booster.initializeMiddleware(app);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    title: '🚀 Velocity Boost - Avanzado',
    endpoints: {
      sensible: 'GET /api/auth (rate limit estricto)',
      publica: 'GET /api/publica (rate limit generoso)',
      noticias: 'GET /api/noticias (cache 5 min)',
      upload: 'POST /api/upload (sin cache)',
    },
  });
});

app.get('/api/auth', booster.rateLimit.strict(), (req, res) => {
  const cacheKey = booster.cache.generateKey(req);
  const cached = booster.cache.get(cacheKey);

  if (cached) return res.json({ ...cached, cached: true });

  const authData = {
    token: 'abc123xyz789',
    expiresIn: 3600,
    type: 'Bearer',
  };

  booster.cache.set(cacheKey, authData, 1800);
  res.json(authData);
});

app.get('/api/publica', booster.rateLimit.generous(), (req, res) => {
  const cacheKey = booster.cache.generateKey(req);
  const cached = booster.cache.get(cacheKey);

  if (cached) return res.json({ ...cached, cached: true });

  const data = {
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };

  booster.cache.set(cacheKey, data, 600);
  res.json(data);
});

app.get('/api/noticias', (req, res) => {
  const cacheKey = booster.cache.generateKey(req);
  const cached = booster.cache.get(cacheKey);

  if (cached) return res.json({ ...cached, cached: true });

  const noticias = [
    { id: 1, titulo: 'Noticia importante', date: new Date() },
    { id: 2, titulo: 'Última actualización', date: new Date() },
  ];

  booster.cache.set(cacheKey, noticias, 300);
  res.json(noticias);
});

app.post('/api/upload', booster.cache.skipCache(), (req, res) => {
  res.json({ uploaded: true, size: 1024 });
});

app.get('/velocity/health', async (req, res) => {
  const health = await booster.getHealth();
  res.json(health);
});

app.get('/velocity/metrics', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const metrics = booster.monitoring.getRecentMetrics(limit);
  res.json({ limit, count: metrics.length, metrics });
});

app.get('/velocity/stats', async (req, res) => {
  const stats = await booster.getStats();
  res.json(stats);
});

app.post('/velocity/cache/clear', async (req, res) => {
  const result = await booster.clearCache();
  res.json(result);
});

app.post('/velocity/gc', (req, res) => {
  const result = booster.forceGC();
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor avanzado corriendo en puerto ${PORT}`);
  console.log(`🎯 Ejemplos:`);
  console.log(`   - GET http://localhost:${PORT}/api/auth (rate limit estricto)`);
  console.log(`   - GET http://localhost:${PORT}/api/publica (rate limit generoso)`);
  console.log(`   - GET http://localhost:${PORT}/api/noticias (cache 5 min)`);
  console.log(`   - GET http://localhost:${PORT}/velocity/health`);
  console.log(`   - GET http://localhost:${PORT}/velocity/dashboard`);
});
