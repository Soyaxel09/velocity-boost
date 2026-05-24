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
});

booster.initializeMiddleware(app);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: '🚀 Velocity Boost activado',
    endpoints: {
      usuarios: 'GET /api/usuarios',
      stats: 'GET /velocity/stats',
      health: 'GET /velocity/health',
      dashboard: 'GET /velocity/dashboard',
    },
  });
});

app.get('/api/usuarios', (req, res) => {
  const cacheKey = booster.cache.generateKey(req);
  const cached = booster.cache.get(cacheKey);

  if (cached) {
    return res.json({ ...cached, fromCache: true });
  }

  const usuarios = [
    { id: 1, nombre: 'Juan', email: 'juan@example.com' },
    { id: 2, nombre: 'María', email: 'maria@example.com' },
    { id: 3, nombre: 'Carlos', email: 'carlos@example.com' },
  ];

  booster.cache.set(cacheKey, usuarios, 60);
  res.json(usuarios);
});

app.get('/velocity/stats', async (req, res) => {
  const stats = await booster.getStats();
  res.json(stats);
});

app.get('/velocity/health', async (req, res) => {
  const health = await booster.getHealth();
  res.json(health);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor básico corriendo en puerto ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/velocity/dashboard`);
  console.log(`📈 Stats: http://localhost:${PORT}/velocity/stats`);
});
