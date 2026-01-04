// import dependencies
import type { Request, Response, NextFunction } from "express";

// import utils
import { redis } from "../utils/redis";
import { decode_token } from "../utils/jwt";
import { cookieOptions } from "../utils/cookie";
import ResponseError from "../utils/response-error";

// initialize
export default async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!token) {
            throw new ResponseError({
                status: 401,
                code: "NOT_AUTHENTICATED",
                message: "Authentication required."
            });
        }

        const decoded = decode_token(token, "access");

        if (!decoded.sid) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Invalid session."
            });
        }

        const session = await redis.get(`session:${decoded.sid}`);
        if (!session) {
            res.clearCookie("refresh_token", cookieOptions);
            res.clearCookie("authenticated", cookieOptions);

            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Invalid session."
            });
        }

        (req as any).user = {
            public_id: decoded.sub,
            session_id: decoded.sid
        };

        next();
    } catch (error) {
        next(error);
    }
}

