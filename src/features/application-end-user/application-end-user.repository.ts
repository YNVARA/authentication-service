// database
import pg from "../../database/pg";

// types
import type { ApplicationEndUserRegisterFormRequest } from "./application-end-user.type";

export default class ApplicationEndUserRepository {

    static async find_application_by_client_id_and_client_secret(client_id: string, client_secret: string) {
        const query = `SELECT id, client_id, client_secret FROM applications WHERE client_id = $1 AND client_secret = $2`;
        const values = [client_id, client_secret]
        const result = await pg.query(query, values);
        if (result.rowCount === 0) return null;
        return {
            id: result.rows[0]?.id,
            client_id: result.rows[0]?.client_id,
            client_secret: result.rows[0]?.client_secret
        };
    }

    static async find_email_by_application_id(application_id: string | number, email: string) {
        const query = `SELECT id, application_id, email FROM applications_users WHERE application_id = $1 AND email = $2`;
        const values = [application_id, email]
        const result = await pg.query(query, values);
        if (result.rowCount === 0) return null;
        return {
            id: result.rows[0]?.id,
            application_id: result.rows[0]?.application_id,
            email: result.rows[0]?.email
        };
    }

    static async create_new_user(application_id: string, data: ApplicationEndUserRegisterFormRequest) {
        const query = `
            INSERT INTO applications_users (application_id, first_name, last_name, email, password_hash)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, application_id, first_name, last_name, email
        `;
        const values = [application_id, data.first_name, data.last_name, data.email, data.password];
        const result = await pg.query(query, values);
        return result.rows[0];
    }

    static async find_user_by_application_id_and_email(application_id: string | number, email: string) {
        const query = `
            SELECT id, application_id, first_name, last_name, email
            FROM applications_users
            WHERE application_id = $1 AND email = $2
        `;
        const values = [application_id, email];
        const result = await pg.query(query, values);
        if (result.rowCount === 0) return null;
        return result.rows[0];
    }

}