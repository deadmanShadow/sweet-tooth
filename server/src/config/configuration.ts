export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },

  initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL,
});
