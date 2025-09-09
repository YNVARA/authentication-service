import 'dotenv/config';
import type { Algorithm } from "jsonwebtoken";

export const AUTH_SERVICE_PORT = process.env.AUTH_SERVICE_PORT || 3000;
export const AUTH_SERVICE_DB = process.env.AUTH_SERVICE_DB;

export const AUTH_SERVICE_ENV = process.env.APP_ENV || "development";
export const AUTH_SERVICE_DOMAIN = process.env.APP_DOMAIN || "localhost";

export const JWT_CONFIG = {
    JWT_ACCESS_TOKEN_SECRET: process.env.AUTH_JWT_ACCESS_TOKEN_SECRET || "supersecret-access",
    JWT_REFRESH_TOKEN_SECRET: process.env.AUTH_JWT_REFRESH_TOKEN_SECRET || "supersecret-refresh",
    ACCESS_TOKEN_EXPIRY: "5m" as const,
    REFRESH_TOKEN_EXPIRY: "1d" as const,
    ALGORITHM: "HS256" as Algorithm,
};