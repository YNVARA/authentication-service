// dependencies
import 'dotenv/config';
import type { Algorithm } from "jsonwebtoken";

// environment variables
export const APP_HOSTNAME = process.env.APP_HOSTNAME || 'localhost';
export const APP_PORT = process.env.APP_PORT || '3000';
export const APP_ENVIRONMENT = process.env.APP_ENVIRONMENT || 'development';

// postgres configuration
export const PG_HOST = process.env.POSTGRESQL_HOST || 'localhost';
export const PG_PORT = Number(process.env.POSTGRESQL_PORT) || 5432;
export const PG_USER = process.env.POSTGRESQL_USER || 'postgres';
export const PG_PASS = process.env.POSTGRESQL_PASSWORD || 'postgres';
export const PG_DB = process.env.POSTGRESQL_DATABASE || 'postgres';
export const PG_MAX_CONNECTIONS = 10;
export const PG_IDLE_TIMEOUT = 30000;
export const PG_CONNECTION_TIMEOUT = 2000;

// jwt configuration
export const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || "supersecret-access";
export const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || "supersecret-refresh";
export const JWT_ACCESS_TOKEN_EXPIRY = "5m" as const;
export const JWT_REFRESH_TOKEN_EXPIRY = "1d" as const;
export const JWT_ALGORITHM: Algorithm = "HS256";