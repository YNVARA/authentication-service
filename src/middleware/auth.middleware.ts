import type { Response, Request, NextFunction } from "express";
import jwt, { type JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { JWT_CONFIG } from "@config";

import ResponseError from "@utils/response-error";

export default async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            throw new ResponseError({
                status: 401,
                code: "NOT_LOGGED_IN",
                message: "You are not logged in. Please login first."
            });
        }

        jwt.verify(token, JWT_CONFIG.JWT_ACCESS_TOKEN_SECRET as string, (err, decoded) => {
            if (err) {
                if (err instanceof TokenExpiredError) {
                    throw new ResponseError({
                        status: 401,
                        code: "TOKEN_EXPIRED",
                        message: "Your session has expired. Please refresh your token."
                    });
                }

                throw new ResponseError({
                    status: 401,
                    code: "INVALID_TOKEN",
                    message: "Invalid authentication token."
                });
            }

            (req as any).user = {
                id: (decoded as JwtPayload).id,
            };

            next();
        });

    } catch (error) {
        next(error);
    }
}