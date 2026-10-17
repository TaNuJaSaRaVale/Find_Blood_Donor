import mongoose from 'mongoose';

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Converts every thrown error into a clean JSON response the frontend can show. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  let errors;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
    message = Object.values(errors)[0];
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue || {})[0] || 'Value'} already exists`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON';
  }

  if (status >= 500) console.error('💥', err);
  res.status(status).json({ message, ...(errors && { errors }) });
}
