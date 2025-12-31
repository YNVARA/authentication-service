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

}