import { Client } from "pg";
import fs from "fs";
import path from "path";
import { PG_CONFIG } from "./config";

export async function initDatabase() {
    const adminClient = new Client({
        host: PG_CONFIG.HOST,
        port: Number(PG_CONFIG.PORT),
        user: PG_CONFIG.USER,
        password: PG_CONFIG.PASSWORD,
        database: "postgres",
    });

    await adminClient.connect();

    const dbName = PG_CONFIG.DATABASE;

    const check = await adminClient.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
    );

    if (check.rowCount === 0) {
        console.log("❌ Database not found, creating...");
        await adminClient.query(`CREATE DATABASE "${dbName}"`);
        console.log("✅ Database created.");
    } else {
        console.log("ℹ️  Database exists.");
    }

    await adminClient.end();

    // Connect to target DB & apply schema
    const appClient = new Client({
        host: PG_CONFIG.HOST,
        port: Number(PG_CONFIG.PORT),
        user: PG_CONFIG.USER,
        password: PG_CONFIG.PASSWORD,
        database: dbName,
    });

    await appClient.connect();

    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    await appClient.query(schemaSQL);

    console.log("✅ Schema applied successfully.");

    await appClient.end();
}
