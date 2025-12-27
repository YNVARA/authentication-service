// import dependencies
import jwt, { type SignOptions, type JwtPayload, type Algorithm } from "jsonwebtoken";
import { randomUUID } from "crypto";

// import config
import { JWT_CONFIG } from "../config";

// import utils
import ResponseError from "./response-error";

// generate tokens
export function generate_tokens(
    user_id: string,
    role: string,
    status: string
) {
    const session_id = randomUUID();

    const accessPayload = {
        sub: user_id,
        sid: session_id,
        role,
        status,
        iss: JWT_CONFIG.ISSUER,
        aud: JWT_CONFIG.AUDIENCE,
    };

    const refreshPayload = {
        sub: user_id,
        sid: session_id,
        iss: JWT_CONFIG.ISSUER,
        aud: JWT_CONFIG.AUDIENCE,
    };

    const access_token = jwt.sign(
        accessPayload,
        JWT_CONFIG.ACCESS_TOKEN_SECRET,
        {
            expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
            algorithm: JWT_CONFIG.ALGORITHM,
        } as SignOptions
        
    );

    const refresh_token = jwt.sign(
        refreshPayload,
        JWT_CONFIG.REFRESH_TOKEN_SECRET,
        {
            expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
            algorithm: JWT_CONFIG.ALGORITHM,
        } as SignOptions
    );

    return { access_token, refresh_token, session_id };
}


// decode tokens
export interface DecodedToken extends JwtPayload {
    sub: string;
    sid: string;
    role?: string;
    status?: string;
}

export function decode_token(
    token: string,
    type: "access" | "refresh" = "access"
): DecodedToken {
    try {
        if (!token) {
            throw new ResponseError({
                status: 401,
                code: "TOKEN_REQUIRED",
                message: "Token is required",
            });
        }

        const secret =
            type === "access"
                ? JWT_CONFIG.ACCESS_TOKEN_SECRET
                : JWT_CONFIG.REFRESH_TOKEN_SECRET;

        const decoded = jwt.verify(token, secret, {
            algorithms: [JWT_CONFIG.ALGORITHM as Algorithm],
            issuer: JWT_CONFIG.ISSUER,
            audience: JWT_CONFIG.AUDIENCE,
        }) as DecodedToken;

        if (!decoded.sub || !decoded.sid) {
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
                code:
                    type === "refresh"
                        ? "REFRESH_TOKEN_EXPIRED"
                        : "ACCESS_TOKEN_EXPIRED",
                message:
                    type === "refresh"
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

export async function refreshAccessToken(refreshToken: string) {
    try {
        const decoded = decode_token(refreshToken, "refresh");

        // 1️⃣ Ambil data user & session dari DB
        // const session = await SessionRepository.findBySid(decoded.sid);
        const session  : { sid: string; revoked: boolean} = {
            sid: decoded.sid,
            revoked: false
        };

        if (!session || session?.revoked) {
            throw new ResponseError({
                status: 401,
                code: "SESSION_INVALID",
                message: "Session is no longer valid. Please login again.",
            });
        }

        // const user = await UserRepository.findById(decoded.sub);
        const user = {
            id: decoded.sub,
            status: "active",
            role: "user"
        };

        if (!user || user.status !== "active") {
            throw new ResponseError({
                status: 403,
                code: "ACCOUNT_NOT_ACTIVE",
                message: "Your account is not active.",
            });
        }

        // 2️⃣ Bangun access token baru dengan data TERKINI
        const accessPayload = {
            sub: user.id,
            sid: decoded.sid,
            role: user.role,
            status: user.status,
            iss: JWT_CONFIG.ISSUER,
            aud: JWT_CONFIG.AUDIENCE,
        };

        const new_access_token = jwt.sign(accessPayload, JWT_CONFIG.ACCESS_TOKEN_SECRET, {
            expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
            algorithm: JWT_CONFIG.ALGORITHM,
        } as SignOptions);

        return new_access_token;
    } catch {
        throw new ResponseError({
            status: 401,
            code: "INVALID_REFRESH_TOKEN",
            message: "Token is invalid or expired",
        });
    }
}
