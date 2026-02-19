/**
 * Creates an Express app wired with all routes for testing.
 * Uses the in-memory SQLite database set up by setup.js.
 */
const express = require('express');
const { errorHandler } = require('../../server/middleware/error-handler');

function createApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.use('/health', require('../../server/routes/health'));
  app.use('/api/auth', require('../../server/routes/auth'));
  app.use('/api/projects', require('../../server/routes/projects/index'));
  app.use('/api/admin', require('../../server/routes/admin'));

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
