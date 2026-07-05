export const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === '23505') { // Postgres unique violation
    return res.status(409).json({ error: 'Record already exists' });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({ error: 'Referenced record not found' });
  }

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Internal server error';

  res.status(status).json({ error: message });
};

export const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};
