// dependencies
import jwt, { type JwtPayload, type SignOptions, type Algorithm } from "jsonwebtoken";

// utils
import ResponseError from "./response-error";

// environment
import {
    JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_SECRET,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY,
    JWT_ALGORITHM
} from "../config";

// interfaces
export interface AccessTokenPayload { id: string; }
export interface RefreshTokenPayload { id: string; }

// function for generating tokens
export function generateClientTokens(userId: string) {
    const accessPayload: AccessTokenPayload = { id: userId };
    const refreshPayload: RefreshTokenPayload = { id: userId };

    const access_token = jwt.sign(accessPayload, JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
        algorithm: JWT_ALGORITHM,
    } as SignOptions);

    const refresh_token = jwt.sign(refreshPayload, JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
        algorithm: JWT_ALGORITHM,
    } as SignOptions);

    return { access_token, refresh_token };
}

// function for decoding and verifying tokens
export function decodeClientToken(token: string, type: "access" | "refresh" = "access"): JwtPayload & { id: string } {
    try {
        if (!token) {
            throw new ResponseError({
                status: 401,
                code: "TOKEN_REQUIRED",
                message: "Token is required",
            });
        }

        const secret = type === "access"
            ? JWT_ACCESS_TOKEN_SECRET
            : JWT_REFRESH_TOKEN_SECRET;

        const decoded = jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM as Algorithm] }) as JwtPayload & { id: string };

        if (!decoded.id) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_TOKEN",
                message: "Token payload invalid",
            });
        }

        return decoded;
    } catch (err: any) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new ResponseError({
                status: 401,
                code: type === "refresh" ? "REFRESH_TOKEN_EXPIRED" : "ACCESS_TOKEN_EXPIRED",
                message: type === "refresh"
                    ? "Your refresh token has expired. Please login again."
                    : "Your access token has expired. Please refresh your session.",
            });
        }

        throw new ResponseError({
            status: 401,
            code: "INVALID_TOKEN",
            message: "Token is invalid",
        });
    }
}

// function for refreshing access token
export function refreshAccessClientToken(token: string) {
    try {
        const decoded = decodeClientToken(token, "refresh");
        const payload: AccessTokenPayload = { id: decoded.id };

        const new_access_token = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
            expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
            algorithm: JWT_ALGORITHM,
        } as SignOptions);

        return new_access_token;
    } catch (err: any) {
        throw new ResponseError({
            status: 401,
            code: "INVALID_REFRESH_TOKEN",
            message: "Token is invalid or expired",
        });
    }
}