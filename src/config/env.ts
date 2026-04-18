import { config } from "dotenv";
import { expand } from "dotenv-expand";

const enviroment = config({ quiet: true });
expand(enviroment);

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  INACTIVITY_TIMEOUT: 1000 * 60 * 60 * 12,
  DATABASE_URL: getDatabaseUrl(),
};

function getDatabaseUrl() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error("❌ Database url indefinida!");

  if (process.env.NODE_ENV === "dev") console.log("🔍 Database url carregada!");
  return DATABASE_URL;
}
