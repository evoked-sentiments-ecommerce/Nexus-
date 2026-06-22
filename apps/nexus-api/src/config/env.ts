// ---------------------------------------------------------------------------
// Environment Configuration — centralized env variable access with defaults
// ---------------------------------------------------------------------------

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  REDIS_URL: process.env.REDIS_URL ?? "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ?? "",
  R2_ENDPOINT: process.env.R2_ENDPOINT ?? "",
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ?? "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ?? "",
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL ?? "https://storage.nexus.app",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "noreply@nexus.app",
  PORT: parseInt(process.env.PORT ?? "3000", 10),
  NODE_ENV: (process.env.NODE_ENV ?? "development") as "development" | "production" | "test",
  SENTRY_DSN: process.env.SENTRY_DSN,
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
  POSTHOG_HOST: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
} as const;
