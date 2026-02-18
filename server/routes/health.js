const router = require('express').Router();
const db = require('../db');

// GET /health
router.get('/', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: 'Database non disponibile'
    });
  }
});

module.exports = router;
