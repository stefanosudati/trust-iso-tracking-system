function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Errore interno del server' : err.message,
  });
}

module.exports = { asyncHandler, errorHandler };
