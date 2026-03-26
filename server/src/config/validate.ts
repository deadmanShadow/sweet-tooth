import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production', 'staging')
    .default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  // Comma-separated list of allowed origins. "*" allows all.
  CORS_ORIGIN: Joi.string().default('*'),

  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),

  DATABASE_URL: Joi.string().uri().required(),
  DIRECT_URL: Joi.string().uri().required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),

  // Allows controlled bootstrap of the first ADMIN user.
  // If unset, registrations create STAFF users only.
  INITIAL_ADMIN_EMAIL: Joi.string().email().optional(),
});
