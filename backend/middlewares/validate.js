import { ApiError } from '../utils/ApiError.js';

/**
 * Validate incoming request against a Zod schema
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} source 
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // assign sanitized/parsed data
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return next(new ApiError(400, 'Validation failed', formattedErrors));
      }
      next(err);
    }
  };
};
