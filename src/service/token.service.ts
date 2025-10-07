import argon2 from "argon2";

import SessionRepository from "@repository/session.repository";

import ResponseError from "@utils/response-error";
import { decodeToken, refreshAccessToken } from "@utils/jwt";

export default class TokenService {

    static async getToken(refreshToken: string, userAgent: string, deviceInfo: string) {
        const decode = decodeToken(refreshToken, "refresh");

        const checkSession = await SessionRepository.checkSession(decode.id, userAgent, deviceInfo);
        if (!checkSession) throw new ResponseError({
            status: 401,
            code: "NOT_LOGGED_IN",
            message: "User not logged in",
        });

        const isRefreshTokenMatch = await argon2.verify(checkSession.refreshTokenHash!, refreshToken);
        if (!isRefreshTokenMatch) throw new ResponseError({
            status: 401,
            code: "INVALID_REFRESH_TOKEN",
            message: "Invalid refresh token",
        });

        const isExpired = decode.exp! < Math.floor(Date.now() / 1000);

        if (isExpired) {
            await SessionRepository.deleteSession(decode.id, userAgent, deviceInfo);
        }

        if (isExpired) throw new ResponseError({
            status: 401,
            code: "REFRESH_TOKEN_EXPIRED",
            message: "Refresh token has expired",
        })

        const response = refreshAccessToken(refreshToken);
        return response;
    }
}