// import utils
import generatePublicId from "../../utils/generate-public-id";
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
            INSERT INTO users (public_id, email, username, hash_password, status, email_verified_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id, public_id, email, username, created_at
        `;
        const values = [generatePublicId(), data.email, data.username, data.hash_password, "pending"];
        const result = await pg.query(query, values);
        return result.rows[0];
    }

    static async login(data: { email_or_username: string, password: string }) {
        const is_email = data.email_or_username.includes("@");
        let response;

        if (is_email) {
            const query = `
                SELECT id, public_id, email, username, hash_password, status, email_verified_at
                FROM users
                WHERE email = $1
            `;
            const result = await pg.query(query, [data.email_or_username]);
            response = result.rows[0];
        } else {
            const query = `
                SELECT id, public_id, email, username, hash_password, role, status, email_verified_at
                FROM users
                WHERE username = $1
            `;
            const result = await pg.query(query, [data.email_or_username]);
            response = result.rows[0];
        }

        return response;
    }

    static async update_last_login(id: string | number) {
        const query = `
            UPDATE users
            SET last_login_at = NOW()
            WHERE id = $1
        `;
        const value = [id];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async store_token_for_email_verification(data : {user_id: string | number, token_hash: string, expires_at: Date}) {
        const query = `
            INSERT INTO authentication_tokens (public_id, user_id, token_hash, token_type, expires_at)
            VALUES ($1, $2, $3, $4, $5)
        `;
        const values = [generatePublicId(), data.user_id, data.token_hash, "email_verification", data.expires_at];
        const result = await pg.query(query, values);
        return result.rows[0];
    }

}
