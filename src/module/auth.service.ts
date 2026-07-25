// config
import { env } from '../config/env';
import { redisClient } from '../config/redis';

// core
import { HttpError } from '../core/errors/http.error';
import { getLogger } from '../core/logger/request-logger';

// type
import type { IAuthenticationRepository } from './auth.interface';
import type { IAuthenticationService } from './auth.interface';

// libs
import { send_email } from '../shared/libs/mailer';
import { generate_otp, hashing_otp } from '../shared/libs/otp';
import { generate_tokens, refresh_access_token } from '../shared/libs/jwt';
import { hashing_password, compare_password } from '../shared/libs/password';

export class AuthenticationService implements IAuthenticationService {
    private logger = getLogger({ layer: 'service', module: 'authentication' });

    constructor(
        private repo: IAuthenticationRepository,
        private container: any,
    ) {}

    async register(data: {
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
        const data_exists = await this.repo.exists_identifier(data.identifier);
        if (data_exists) {
            throw new HttpError(400, 'User already exists', 'USER_ALREADY_EXISTS', true);
        }

        const password_hash = await hashing_password(data.password_hash);
        data.password_hash = password_hash;

        const user = await this.repo.create_user(data);

        if (!data.is_verified && data.identifier.kind === 'EMAIL') {
            const otp = generate_otp(6);
            const hash_otp = hashing_otp(otp);
            const normalize_email = data.identifier.value.toLowerCase().trim();

            await redisClient.set(`email_verification:${normalize_email}`, hash_otp, 'EX', env.ttl.verification);

            await send_email({
                to: data.identifier.value,
                subject: 'Verify Your Email',
                html: `<p>Your verification code is: <b>${otp}</b></p><p>This code will expire in ${env.ttl.verification / 3600} hours.</p>`,
            });
        }

        return user;
    }

    async login(
        data: {
            identifier: {
                kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM';
                value: string;
                type: string;
            };
            password_hash: string;
        },
        metadata?: { ip?: string; user_agent?: string },
    ): Promise<any> {
        const user = await this.repo.find_by_identifier(data.identifier);
        if (!user) {
            throw new HttpError(400, 'User not found', 'USER_NOT_FOUND', true);
        }

        const password_match = await compare_password(data.password_hash, user.password_hash);
        if (!password_match) {
            throw new HttpError(400, 'Invalid password', 'INVALID_PASSWORD', true);
        }

        const { access_token, refresh_token, session_id } = await generate_tokens(user.id);
        const session_data = {
            user_id: user.id,
            ip: metadata?.ip,
            user_agent: metadata?.user_agent,
            created_at: new Date().toISOString(),
        };

        await redisClient.set(`session:${session_id}`, JSON.stringify(session_data), 'EX', env.ttl.session);
        await redisClient.sadd(`user_sessions:${user.id}`, session_id);

        return { user, access_token, refresh_token };
    }

    async generate_token(data: { refresh_token: string }): Promise<any> {
        const accessToken = await refresh_access_token(data.refresh_token);
        return { access_token: accessToken };
    }

    async me(user_id: string): Promise<any> {
        const user = await this.repo.find_by_id(user_id);
        if (!user) throw new HttpError(404, 'User not found', 'USER_NOT_FOUND', true);
        return user;
    }

    async logout(data: { sid: string; user_id?: string }): Promise<void> {
        const sessionData = await redisClient.get(`session:${data.sid}`);
        let user_id = data.user_id;

        if (sessionData && !user_id) {
            user_id = JSON.parse(sessionData).user_id;
        }

        await redisClient.del(`session:${data.sid}`);
        if (user_id) {
            await redisClient.srem(`user_sessions:${user_id}`, data.sid);
        }
    }
}
