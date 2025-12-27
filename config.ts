// import dependencies
import dotenv from "dotenv";

// initialize
dotenv.config();

// app config
export const APP_CONFIG = {
    NAME: process.env.APP_NAME,
    VERSION: process.env.APP_VERSION,
    HOST: process.env.APP_HOST,
    PORT: process.env.APP_PORT
}

// database config
export const PG_CONFIG = {
    HOST: process.env.PG_DB_HOST,
    PORT: process.env.PG_DB_PORT,
    USER: process.env.PG_DB_USER,
    PASSWORD: process.env.PG_DB_PASS,
    DATABASE: process.env.PG_DB_NAME,
    MAX_CONNECTION: process.env.PG_MAX_CONNECTION,
    IDLE_TIMEOUT: process.env.PG_IDLE_TIMEOUT,
    CONNECTION_TIMEOUT: process.env.PG_CONNECTION_TIMEOUT
}

// jwt config
export const JWT_CONFIG = {
    ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET || "supersecret-access",
    REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET || "supersecret-refresh",
    ACCESS_TOKEN_EXPIRY: "5m" as const,
    REFRESH_TOKEN_EXPIRY: "1d" as const,
    ALGORITHM: "HS256",
    ISSUER: process.env.JWT_ISSUER || "auth-service",
    AUDIENCE: process.env.JWT_AUDIENCE || "auth-service"
}

// redis config
export const REDIS_CONFIG = {
    HOST: process.env.REDIS_HOST,
    PORT: Number(process.env.REDIS_PORT),
    PASSWORD: process.env.REDIS_PASS
}