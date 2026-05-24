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
      noticias: 'GET /api/noticias (cache automático)',
      upload: 'POST /api/upload (sin cache)',
    },
  });
});

app.get('/api/auth', booster.rateLimit.strict(), (req, res) => {
  res.json({
    token: 'abc123xyz789',
    expiresIn: 3600,
    type: 'Bearer',
  });
});

app.get('/api/publica', booster.rateLimit.generous(), (req, res) => {
  res.json({
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/noticias', (req, res) => {
  res.json([
    { id: 1, titulo: 'Noticia importante', date: new Date() },
    { id: 2, titulo: 'Última actualización', date: new Date() },
  ]);
});

app.post('/api/upload', booster.cache.skipCache(), (req, res) => {
  res.json({ uploaded: true, size: 1024 });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor avanzado corriendo en puerto ${PORT}`);
  console.log(`   - GET http://localhost:${PORT}/api/auth`);
  console.log(`   - GET http://localhost:${PORT}/api/publica`);
  console.log(`   - GET http://localhost:${PORT}/api/noticias`);
  console.log(`   - GET http://localhost:${PORT}/velocity/health`);
  console.log(`   - GET http://localhost:${PORT}/velocity/dashboard`);
});
