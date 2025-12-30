// import utils
import pg from "../../utils/pg";

// repository for handle authentication
export default class AuthRepository {

    static async count_email(email: string) {
        const query = `
            SELECT COUNT(*) as total
            FROM users
            WHERE email = $1
        `;
        const result = await pg.query(query, [email]);
        return result.rows[0].total;
    }

    static async count_username(username: string) {
        const query = `
            SELECT COUNT(*) as total
            FROM users
            WHERE username = $1
        `;
        const result = await pg.query(query, [username]);
        return result.rows[0].total;
    }

    static async create_user(data: {
        email: string,
        username: string,
        hash_password: string
    }) {
        const query = `
        INSERT INTO users (email, username, hash_password)
        VALUES ($1, $2, $3)
        RETURNING id, email, username, created_at
    `;
        const value = [data.email, data.username, data.hash_password];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async login(data: { email_or_username: string, password: string }) {
        const is_email = data.email_or_username.includes("@");
        let response;

        if (is_email){
            const query = `
                SELECT id, email, username, hash_password, status, email_verified_at, last_login_at
                FROM users
                WHERE email = $1
            `;
            const result = await pg.query(query, [data.email_or_username]);
            response = result.rows[0];
        } else {
            const query = `
                SELECT id, email, username, hash_password, role, status, email_verified_at, last_login_at
                FROM users
                WHERE username = $1
            `;
            const result = await pg.query(query, [data.email_or_username]);
            response = result.rows[0];
        }

        return response;
    }

    static async update_last_login(id : string | number) {
        const query = `
            UPDATE users
            SET last_login_at = NOW()
            WHERE id = $1
        `;
        const value = [id];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

}