// dependencies
import { Pool } from "pg";

// environment variables
import { PG_HOST, PG_PORT, PG_USER, PG_PASS, PG_DB, PG_MAX_CONNECTIONS, PG_IDLE_TIMEOUT, PG_CONNECTION_TIMEOUT } from "../config";

const pg = new Pool({
    host: PG_HOST,
    port: PG_PORT as number,
    user: PG_USER,
    password: PG_PASS,
    database: PG_DB,
    max: PG_MAX_CONNECTIONS,
    idleTimeoutMillis: PG_IDLE_TIMEOUT,
    connectionTimeoutMillis: PG_CONNECTION_TIMEOUT,
});

// export default
export default pg;