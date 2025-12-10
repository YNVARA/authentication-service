// database
import pg from "../../database/pg";

// types
import type { ApplicationDeveloperFormRequest } from "./application-developer.type";

// utils
import generateClientId from "../../utils/generate-client-id";
import generateClientSecret from "../../utils/generate-client-secret";

export default class ApplicationDeveloperRepository {

    static async appliaction_by_name_and_developer_id_is_exists(name: string, developer_id: string | number) {
        const query = `SELECT COUNT(*) FROM applications WHERE name = $1 AND developer_id = $2`;
        const values = [name, developer_id];
        const result = await pg.query(query, values);
        return parseInt(result.rows[0].count, 10) > 0;
    }

    static async find_application_by_id_and_developer_id(application_id: string | number, developer_id: string | number) {
        const query = `SELECT id, developer_id FROM applications WHERE id = $1 AND developer_id = $2`;
        const values = [application_id, developer_id];
        const result = await pg.query(query, values);
        if (result.rows.length === 0) {
            return null;
        }
        return {
            id: result.rows[0]?.id,
            developer_id: result.rows[0]?.developer_id,
        }
    }

    static async create_application_developer_id(developer_id: string | number, data: ApplicationDeveloperFormRequest) {
        const query = `
            INSERT INTO applications (developer_id, name, description, client_id, client_secret, allowed_origins)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, developer_id, name, description, client_id, client_secret, allowed_origins, created_at
        `;
        const values = [developer_id, data.name, data.description, generateClientId(), generateClientSecret(), data.allowed_origins || []];
        const result = await pg.query(query, values);
        return {
            id: result.rows[0]?.id,
            developer_id: result.rows[0]?.developer_id,
            name: result.rows[0]?.name,
            description: result.rows[0]?.description,
            client_id: result.rows[0]?.client_id,
            client_secret: result.rows[0]?.client_secret,
            allowed_origins: result.rows[0]?.allowed_origins,
            created_at: result.rows[0]?.created_at,
        };
    }

    static async update_client_secret_by_application_id_and_developer_id(application_id: string | number, developer_id: string | number) {
        const query = `
            UPDATE applications set
                client_secret = $1
            WHERE id = $2 AND developer_id = $3
            RETURNING id, developer_id, name, description, client_secret
        `;

        const values = [generateClientSecret(), application_id, developer_id];
        const result = await pg.query(query, values);
        return {
            id: result.rows[0]?.id,
            developer_id: result.rows[0]?.developer_id,
            client_secret: result.rows[0]?.client_secret
        }
    }

    static async update_application_by_id_and_developer_id(application_id: string | number, developer_id: string | number, data: ApplicationDeveloperFormRequest) {
        const query = `
            UPDATE applications set
                name = $1,
                description = $2,
                allowed_origins = $3,
                active = $4
            WHERE id = $5 AND developer_id = $6
            RETURNING id, developer_id, name, description, client_id, client_secret, allowed_origins, active, updated_at
        `;

        const values = [data.name, data.description, data.allowed_origins || [], data.active, application_id, developer_id];
        const result = await pg.query(query, values);
        return {
            id: result.rows[0]?.id,
            developer_id: result.rows[0]?.developer_id,
            name: result.rows[0]?.name,
            description: result.rows[0]?.description,
            client_id: result.rows[0]?.client_id,
            client_secret: result.rows[0]?.client_secret,
            allowed_origins: result.rows[0]?.allowed_origins,
            active: result.rows[0]?.active,
            updated_at: result.rows[0]?.updated_at,
        };
    }

    static async get_all_application_by_developer_id(developer_id: string | number) {
        const query = `
        SELECT 
            app.id, 
            app.developer_id, 
            app.name, 
            app.active, 
            app.created_at,
            developer.first_name, 
            developer.last_name, 
            developer.email
        FROM applications AS app
        JOIN developer_accounts AS developer
            ON app.developer_id = developer.id
        WHERE app.developer_id = $1
        ORDER BY app.created_at DESC
    `;

        const values = [developer_id];
        const result = await pg.query(query, values);
        return result.rows.map(row => ({
            id: row.id,
            developer_id: row.developer_id,
            name: row.name,
            active: row.active,
            created_at: row.created_at,
            developer: {
                full_name: row.first_name + " " + row.last_name,
                email: row.email,
            }
        }))
    }

    static async get_application_by_id_and_developer_id(application_id: string | number, developer_id: string | number) {
        const query = `SELECT * FROM applications WHERE id = $1 AND developer_id = $2`;
        const values = [application_id, developer_id];
        const result = await pg.query(query, values);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }

    static async delete_application_by_id_and_developer_id(application_id: string | number, developer_id: string | number) {
        const query = `DELETE FROM applications WHERE id = $1 AND developer_id = $2`;
        const values = [application_id, developer_id];
        await pg.query(query, values);
    }

}