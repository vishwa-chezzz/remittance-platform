exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

// Central error handler (Better Error Handling)
exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate value: already exists' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID' });
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};
