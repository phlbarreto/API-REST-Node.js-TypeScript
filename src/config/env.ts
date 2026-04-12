import "dotenv/config";

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  INACTIVITY_TIMEOUT: 1000 * 60 * 60 * 12,
  DATABASE_URL: process.env.DATABASE_URL,
};
