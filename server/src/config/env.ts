import dotenv from "dotenv";

dotenv.config();

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  jwtSecret: requiredEnv("JWT_SECRET"),
  jwtRefreshSecret: requiredEnv("JWT_REFRESH_SECRET"),
  mongoUri: requiredEnv("MONGODB_URI"),
  port: process.env.PORT || "5000",
};
