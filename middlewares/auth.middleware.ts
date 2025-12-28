// import dependencies
import type { Request, Response, NextFunction } from "express";

// import utils
import { redis } from "../utils/redis";
import { decode_token } from "../utils/jwt";
import ResponseError from "../utils/response-error";

// import config
import { JWT_CONFIG } from "../config";

export default async function AuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // get token from header
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];

        // if token not found
        if (!token) {
            throw new ResponseError({
                status: 401,
                code: "NOT_LOGGED_IN",
                message: "You are not logged in. Please login first."
            });
        }

        // decode token
        const decoded = decode_token(token, "access");

        // make sure sid is there
        if (!decoded.sid) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Session ID is missing."
            });
        }

        // make sure sid is in redis
        const sid = await redis.get(`session:${decoded.sid}`);
        if (!sid) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Session ID is invalid."
            });
        }

        // make sure iss == issuer config
        if (decoded.iss !== JWT_CONFIG.ISSUER) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_ISSUER",
                message: "Invalid token issuer."
            });
        }

        // make sure aud == audience config
        if (decoded.aud !== JWT_CONFIG.AUDIENCE) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_AUDIENCE",
                message: "Invalid token audience."
            });
        }

        // make sure token is not expired
        if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
            throw new ResponseError({
                status: 401,
                code: "TOKEN_EXPIRED",
                message: "Your session has expired."
            });
        }

        // inject user to request
        (req as any).user = {
            id: decoded.sub,
            role: decoded.role!,
            status: decoded.status!,
            session_id: decoded.sid
        };

        next();
    } catch (err) {
        next(err);
    }
}
