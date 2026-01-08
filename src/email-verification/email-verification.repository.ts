// import utils
import pg from "../../utils/pg";

// repository for handle email verification
export default class EmailVerificationRepository {

    static async get_token_data(token_hash: string) {
        const query = `
            SELECT *
            FROM authentication_tokens
            WHERE token_hash = $1
        `;
        const value = [token_hash];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async get_data_user_by_user_id_on_email_verification_token(user_id: string | number) {
        const query = `
            SELECT id, status, email_verified_at
            FROM users
            WHERE id = $1
        `;
        const value = [user_id];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async update_user_email_verification_and_status(user_id: string | number) {
        const query = `
            UPDATE users
            SET email_verified_at = NOW(), status = 'active'
            WHERE id = $1
        `;
        const value = [user_id];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async update_token_as_used(token_hash: string) {
        const query = `
            UPDATE authentication_tokens
            SET used_at = NOW()
            WHERE token_hash = $1
        `;
        const value = [token_hash];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

}