// dependencies
import jwt, { type SignOptions, type JwtPayload, type Algorithm } from 'jsonwebtoken';
import { randomUUID } from 'crypto';

// core
import { HttpError } from '../../core/errors/http.error';

// config
import { env } from '../../config/env';
import { redisClient } from '../../config/redis';

export interface DecodedToken extends JwtPayload {
    sub: string;
    sid: string;
}

export function generate_tokens(id: string) {
    const session_id = randomUUID();

    const accessPayload = {
        sub: id,
        sid: session_id,
        iss: env.jwt.issuer,
        aud: env.jwt.audience,
    };

    const refreshPayload = {
        sub: id,
        sid: session_id,
        iss: env.jwt.issuer,
        aud: env.jwt.audience,
    };

    const access_token = jwt.sign(accessPayload, env.jwt.accessTokenSecret, {
        expiresIn: env.jwt.accessTokenExpiry,
        algorithm: env.jwt.algorithm,
    } as SignOptions);

    const refresh_token = jwt.sign(refreshPayload, env.jwt.refreshTokenSecret, {
        expiresIn: env.jwt.refreshTokenExpiry,
        algorithm: env.jwt.algorithm,
    } as SignOptions);

    return { access_token, refresh_token, session_id };
}

export function decode_token(token: string, type: 'access' | 'refresh' = 'access'): DecodedToken {
    try {
        if (!token) {
            throw new HttpError(401, 'Token is required', 'TOKEN_REQUIRED', true);
        }

        const secret = type === 'access' ? env.jwt.accessTokenSecret : env.jwt.refreshTokenSecret;
        const decoded = jwt.verify(token, secret, {
            algorithms: [env.jwt.algorithm as Algorithm],
            issuer: env.jwt.issuer,
            audience: env.jwt.audience,
        }) as DecodedToken;

        if (!decoded.sub || !decoded.sid) {
            throw new HttpError(401, 'Token payload invalid', 'INVALID_TOKEN', true);
        }

        return decoded;
    } catch (err: any) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new HttpError(
                401,
                type === 'refresh' ? 'Your refresh token has expired. Please login again.' : 'Your access token has expired. Please refresh your session.',
                type === 'refresh' ? 'REFRESH_TOKEN_EXPIRED' : 'ACCESS_TOKEN_EXPIRED',
                true,
            );
        }

        throw new HttpError(401, 'Token is invalid', 'INVALID_TOKEN', true);
    }
}

export async function refresh_access_token(refresh_token: string) {
    try {
        const decoded = decode_token(refresh_token, 'refresh');

        const session_data = await redisClient.get(`session:${decoded.sid}`);
        if (!session_data) {
            throw new HttpError(401, 'Invalid session', 'INVALID_SESSION', true);
        }

        const accessPayload = {
            sub: decoded.sub,
            sid: decoded.sid,
            iss: env.jwt.issuer,
            aud: env.jwt.audience,
        };

        const token = jwt.sign(accessPayload, env.jwt.accessTokenSecret, {
            expiresIn: env.jwt.accessTokenExpiry,
            algorithm: env.jwt.algorithm,
        } as SignOptions);

        return token;
    } catch (error) {
        throw new HttpError(401, 'Session is invalid', 'INVALID_SESSION', true);
    }
}
