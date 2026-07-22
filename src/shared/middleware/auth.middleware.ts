// dependencies
import type { Request, Response, NextFunction } from 'express';

// core
import { HttpError } from '../../core/errors/http.error';

// config
import { redisClient } from '../../config/redis';
import { cookie_options } from '../../config/cookie';

// libs
import { decode_token } from '../libs/jwt';

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const auth_header = req.headers.authorization;

        const token = auth_header?.split(' ')[1];
        if (!token) {
            throw new HttpError(401, 'Authentication required', 'NOT_AUTHENTICATED', true);
        }

        const decoded = decode_token(token, 'access');
        const session = await redisClient.get(`session:${decoded.sid}`);

        if (!session) {
            res.clearCookie('refresh_token', cookie_options);
            res.clearCookie('authenticated', cookie_options);
            throw new HttpError(401, 'Invalid session', 'INVALID_SESSION', true);
        }

        if (!decoded.sid) {
            throw new HttpError(401, 'Invalid session', 'INVALID_SESSION', true);
        }

        (req as any).user = {
            id: decoded.sub,
            session_id: decoded.sid,
        };
        next();
    } catch (error) {
        next(error);
    }
}
