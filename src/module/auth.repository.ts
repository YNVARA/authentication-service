import { HttpError } from '../core/errors/http.error';
import type { DatabaseClient, TransactionClient } from '../config/database/types';
import type { IAuthenticationRepository } from './auth.interface';

export class AuthenticationRepository implements IAuthenticationRepository {
    constructor(private readonly db: DatabaseClient) {}

    async create_user(data: {
        identifier: {
            kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM';
            value: string;
            type: string;
        };
        password_hash: string;
        first_name?: string;
        last_name?: string;
        is_verified?: boolean;
    }): Promise<any> {
        if (!this.db.transaction) {
            throw new HttpError(400, 'Database does not support transactions', 'TRANSACTION_NOT_SUPPORTED', true);
        }

        return this.db.transaction(async (tx: TransactionClient) => {
            const q_insert_user = `INSERT INTO auth.users (status) VALUES ('ACTIVE') RETURNING id, status, created_at`;

            const q_insert_identifier = `
                INSERT INTO auth.user_identifiers (user_id, kind, type, value, normalized_value, is_primary, verified_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`;

            const q_insert_password = `
                INSERT INTO auth.password_credentials (user_id, password_hash)
                VALUES ($1, $2)`;

            const q_insert_profile = `
                INSERT INTO auth.user_profiles (user_id, first_name, last_name)
                VALUES ($1, $2, $3)`;

            const normalized_value = data.identifier.value.toLowerCase().trim();
            const verified_at = data.is_verified ? 'NOW()' : null;

            const insert_user = await tx.query(q_insert_user);
            const user = insert_user.rows[0];

            await tx.query(q_insert_identifier, [user.id, data.identifier.kind, data.identifier.type, data.identifier.value, normalized_value, true, verified_at]);
            await tx.query(q_insert_password, [user.id, data.password_hash]);
            await tx.query(q_insert_profile, [user.id, data.first_name?.toLowerCase().trim(), data.last_name?.toLowerCase().trim()]);

            return user;
        });
    }

    async exists_identifier(data: { kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM'; value: string; type: string }): Promise<boolean> {
        const q = `SELECT EXISTS (SELECT 1 FROM auth.user_identifiers WHERE kind = $1 AND type = $2 AND value = $3)`;
        const result = await this.db.query(q, [data.kind, data.type, data.value]);
        return result.rows[0].exists;
    }

    async find_by_identifier(data: { kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM'; value: string; type: string }): Promise<any> {
        const normalized_value = data.value.toLowerCase().trim();
        const type_condition = data.type ? 'AND ui.type = $3' : '';
        const params = data.type ? [data.kind, normalized_value, data.type] : [data.kind, normalized_value];

        const query = `
            SELECT
                u.id,
                u.status,
                ui.kind as identifier_kind,
                ui.value as identifier_value,
                ui.verified_at,
                pc.password_hash
            FROM auth.users u
            JOIN auth.user_identifiers ui ON u.id = ui.user_id
            JOIN auth.password_credentials pc ON u.id = pc.user_id
            WHERE ui.kind = $1 AND ui.normalized_value = $2 ${type_condition}
        `;
        const res = await this.db.query(query, params);
        return res.rows[0];
    }

    async find_by_id(id: string): Promise<any> {
        const query = `
            SELECT
                u.id,
                u.status,
                u.created_at,
                up.first_name,
                up.last_name,
                up.avatar_url,
                (SELECT value FROM auth.user_identifiers WHERE user_id = u.id AND is_primary = TRUE LIMIT 1) as primary_identifier
            FROM auth.users u
            LEFT JOIN auth.user_profiles up ON u.id = up.user_id
            WHERE u.id = $1
        `;
        const res = await this.db.query(query, [id]);
        return res.rows[0];
    }

    async save_password(user_id: string, password_hash: string): Promise<any> {
        const q = `INSERT INTO auth.password_credentials (user_id, password_hash) VALUES ($1, $2)`;
        await this.db.query(q, [user_id, password_hash]);
    }

    async get_password_hash(user_id: string): Promise<any> {
        const q = `SELECT password_hash FROM auth.password_credentials WHERE user_id = $1`;
        const res = await this.db.query(q, [user_id]);
        return res.rows[0]?.password_hash;
    }
}
