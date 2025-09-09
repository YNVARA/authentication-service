import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { AUTH_SERVICE_DB } from "@/config";
import ResponseError from "@/utils/response-error";
import * as schema from "@schema";

if (!AUTH_SERVICE_DB) {
    throw new ResponseError({
        status: 500,
        code: "DATABASE_CONNECTION_STRING_NOT_FOUND",
        message: "Database connection string not found"
    });
}

const pool = new Pool({
    connectionString: AUTH_SERVICE_DB,
});

const db = drizzle(pool, { schema });
export default db;
