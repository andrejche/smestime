import multer from 'multer';

export const notFound = (req, res, next) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Сликата е преголема. Максимум 10MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: err.field || 'Само JPG, PNG или WebP слики се дозволени' });
    }
    return res.status(400).json({ error: err.message });
  }

  // File type error from fileFilter
  if (err.message && err.message.includes('слики се дозволени')) {
    return res.status(400).json({ error: err.message });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Невалиден токен' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Токенот е истечен' });
  }

  // Postgres errors
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Записот веќе постои' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Поврзаниот запис не постои' });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Внатрешна грешка на серверот' : err.message,
  });
};
