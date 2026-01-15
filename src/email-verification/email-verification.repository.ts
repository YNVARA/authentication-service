// import utils
import pg from "../../utils/pg";

// repository for handle email verification
export default class EmailVerificationRepository {

    static async get_token_data(token_hash: string, token_type: string) {
        const query = `
            SELECT id, user_id, expires_at, used_at
            FROM authentication_tokens
            WHERE token_hash = $1 AND token_type = $2
        `;
        const result = await pg.query(query, [token_hash, token_type]);
        return result.rows[0] ?? null;
    }

    static async get_user_by_id(user_id: string | number) {
        const query = `
            SELECT id, status, email_verified_at
            FROM users
            WHERE id = $1
        `;
        const result = await pg.query(query, [user_id]);
        return result.rows[0] ?? null;
    }

    static async verify_user_email(user_id: string | number) {
        const query = `
            UPDATE users
            SET email_verified_at = NOW(), status = 'active'
            WHERE id = $1
            RETURNING id, status, email_verified_at
        `;
        const result = await pg.query(query, [user_id]);
        return result.rows[0];
    }

    static async mark_token_as_used(token_id: string | number) {
        const query = `
            UPDATE authentication_tokens
            SET used_at = NOW()
            WHERE id = $1
            RETURNING id, used_at
        `;
        const result = await pg.query(query, [token_id]);
        return result.rows[0];
    }

    static async get_email(email: string) {
        const query = `
            SELECT id, email
            FROM users
            WHERE email = $1
        `;
        const result = await pg.query(query, [email]);
        return result.rows[0];
    }

}