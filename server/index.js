require('dotenv').config();
const express = require('express');
const path = require('path');

// Validate required env vars
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('ERRORE: JWT_SECRET non configurato o troppo corto (min 16 caratteri).');
  console.error('Imposta JWT_SECRET nel file .env o come variabile d\'ambiente.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));

// SPA fallback: serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Errore non gestito:', err);
  res.status(500).json({ error: 'Errore interno del server' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Trust ISO Tracking System v2.0`);
  console.log(`  Server in ascolto su http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health\n`);
});
