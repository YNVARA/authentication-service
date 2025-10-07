import { defineConfig } from 'drizzle-kit';
import { AUTH_SERVICE_DB } from './src/config';
import ResponseError from "./src/utils/response-error";

if (!AUTH_SERVICE_DB) {
    throw new ResponseError({
        status: 500,
        code: "DATABASE_CONNECTION_STRING_NOT_FOUND",
        message: "Database connection string not found"
    });
}

export default defineConfig({
    out: './drizzle',
    schema: './src/database/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: AUTH_SERVICE_DB,
    },
});
