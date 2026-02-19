require('dotenv').config();
const express = require('express');
const path = require('path');

// Validate required env vars
if (!process.env.JWT_SECRET) {
  console.error('ERRORE FATALE: JWT_SECRET non configurato.');
  console.error('Imposta JWT_SECRET come variabile d\'ambiente.');
  console.error('ENV vars disponibili:', Object.keys(process.env).filter(k => !k.startsWith('npm_')).join(', '));
  process.exit(1);
}

const { errorHandler } = require('./middleware/error-handler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects/index'));
app.use('/api/admin', require('./routes/admin'));

// SPA fallback: serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Trust ISO Tracking System beta`);
  console.log(`  Server in ascolto su http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health\n`);
});
