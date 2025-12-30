// import utils
import pg from "../../utils/pg";

// repository for handle credential
export default class CredentialRepository {

    static async validation_old_password(user_id:string | number){
        const query = `
            SELECT id, hash_password
            FROM users
            WHERE id = $1
        `;
        const value = [user_id];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

    static async update_password(data : {
        user_id: string,
        hash_password: string
    }){
        const query = `
            UPDATE users
            SET hash_password = $2
            WHERE id = $1
        `;
        const value = [data.user_id, data.hash_password];
        const result = await pg.query(query, value);
        return result.rows[0];
    }

}