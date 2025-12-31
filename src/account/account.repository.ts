// import utils
import pg from "../../utils/pg";

// repository for handle account
export default class AccountRepository {

    static async password_validation_by_user_id(user_id: string | number) {
        const query = `
            SELECT id, hash_password
            FROM users
            WHERE id = $1
        `;
        const value = [user_id];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async update_status_user(data: {
        user_id: string | number,
        status: string
    }) {
        const query = `
            UPDATE users
            SET status = $2
            WHERE id = $1
        `;
        const value = [data.user_id, data.status];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async get_my_account(user_id: string | number) {
        const query = `
            SELECT id, email, username, status, email_verified_at, created_at
            FROM users
            WHERE id = $1
        `;
        const value = [user_id];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async check_current_username(user_id: string | number) {
        const query = `
            SELECT username
            FROM users
            WHERE id = $1
        `;
        const value = [user_id];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async username_is_exist(username: string) {
        const query = `
            SELECT username
            FROM users
            WHERE username = $1
        `;
        const value = [username];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async update_username(data: {
        user_id: string | number,
        username: string
    }){
        const query = `
            UPDATE users
            SET username = $2
            WHERE id = $1
        `;
        const value = [data.user_id, data.username];
        const result = await pg.query(query, value);
        return result.rows[0];
    }
}