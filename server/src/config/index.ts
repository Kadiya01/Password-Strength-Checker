import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getEnvInt(key: string, fallback: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : fallback;
}

export const config = {
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  PORT: getEnvInt("PORT", 3000),
  CLIENT_URL: getEnvVar("CLIENT_URL", "http://localhost:5173"),
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnvVar("JWT_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: getEnvVar("JWT_REFRESH_EXPIRES_IN", "7d"),
  BCRYPT_ROUNDS: getEnvInt("BCRYPT_ROUNDS", 12),
  RATE_LIMIT_WINDOW_MS: getEnvInt("RATE_LIMIT_WINDOW_MS", 900000),
  RATE_LIMIT_MAX_REQUESTS: getEnvInt("RATE_LIMIT_MAX_REQUESTS", 100),
  MAX_LOGIN_ATTEMPTS: getEnvInt("MAX_LOGIN_ATTEMPTS", 5),
  LOCKOUT_DURATION_MS: getEnvInt("LOCKOUT_DURATION_MS", 1800000),
} as const;
