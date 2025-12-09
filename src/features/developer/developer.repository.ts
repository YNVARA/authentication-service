// database
import pg from "../../database/pg";

// types
import type { DeveloperRegisterFormRequest, DeveloperProfileUpdateFormRequest } from "./developer.type";

export default class DeveloperRepository {

    static async email_exists(email: string) {
        const query = `SELECT COUNT(*) FROM developer_accounts WHERE email = $1`;
        const values = [email];
        const result = await pg.query(query, values);
        return parseInt(result.rows[0].count, 10) > 0;
    }

    static async create_developer_account(data: DeveloperRegisterFormRequest) {
        const query = `
            INSERT INTO developer_accounts (first_name, last_name, email, password_hash) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, first_name, last_name, email, created_at
        `;
        const values = [data.first_name, data.last_name, data.email, data.password];
        const result = await pg.query(query, values);
        return result.rows[0];
    }

    static async get_developer_by_email(email: string) {
        const query = `SELECT id, email,password_hash, avatar_path FROM developer_accounts WHERE email = $1`;
        const values = [email];
        const result = await pg.query(query, values);

        if (result.rowCount === 0) return null;
        return {
            id: result.rows[0]?.id,
            email: result.rows[0]?.email,
            password_hash: result.rows[0]?.password_hash,
        }
    }

    static async get_developer_profile(developer_id: string | number) {
        const query = `SELECT id, first_name, last_name, email, avatar_path, created_at FROM developer_accounts WHERE id = $1`;
        const values = [developer_id];
        const result = await pg.query(query, values);

        if (result.rowCount === 0) return null;
        return {
            id: result.rows[0]?.id,
            first_name: result.rows[0]?.first_name,
            last_name: result.rows[0]?.last_name,
            email: result.rows[0]?.email,
            avatar_path: result.rows[0]?.avatar_path,
        }
    }

    static async update_developer_profile(developer_id: string | number, data: DeveloperProfileUpdateFormRequest) {
        const query = `
            UPDATE developer_accounts 
            SET first_name = $1, last_name = $2 
            WHERE id = $3 
            RETURNING id, first_name, last_name, email, avatar_path, created_at
        `;
        const values = [data.first_name, data.last_name, developer_id];
        const result = await pg.query(query, values);

        if (result.rowCount === 0) return null;
        return {
            id: result.rows[0]?.id,
            first_name: result.rows[0]?.first_name,
            last_name: result.rows[0]?.last_name,
            email: result.rows[0]?.email,
            avatar_path: result.rows[0]?.avatar_path,
        }
    }

}