import argon2 from "argon2";

import AuthRepository from "@repository/auth.repository";
import ResponseError from "@utils/response-error";
import { generateTokens, decodeToken, refreshAccessToken } from "@utils/jwt";

export default class AuthService {

    static async isEmailTaken(email: string) {
        const response = await AuthRepository.isEmailTaken(email);
        if (response) throw new ResponseError({
            status: 400,
            code: "EMAIL_TAKEN",
            message: "Email already taken"
        });
    }

    static async localRegister(email: string, password: string) {
        await this.isEmailTaken(email);
        const passwordHash = await argon2.hash(password);
        const response = await AuthRepository.localRegister(email, passwordHash);
        return response;
    }

    static async addOAuthProvider(userId: string, provider: string, providerUserId: string) {
        const response = await AuthRepository.addOAuthProvider(userId, provider, providerUserId);
        return response;
    }

    static async checkSession(userId: string, userAgent: string, deviceInfo: string) {
        const checkSession = await AuthRepository.checkSession(userId, userAgent, deviceInfo);
        if (checkSession) throw new ResponseError({
            status: 401,
            code: "ALREADY_LOGGED_IN",
            message: "User already logged in",
        })
    }

    static async localLogin(email: string, password: string, userAgent: string, deviceInfo: string) {
        const invalidCredentials = () => {
            throw new ResponseError({
                status: 401,
                code: "INVALID_CREDENTIALS",
                message: "Invalid credentials",
            });
        };

        const user = await AuthRepository.localLogin(email);
        if (!user || !user.passwordHash) invalidCredentials();

        const isPasswordMatch = await argon2.verify(user?.passwordHash!, password);
        if (!isPasswordMatch) invalidCredentials();

        const localProvider = await AuthRepository.getOAuthProvider(user?.id!, "local");
        if (!localProvider || localProvider.providerUserId !== email) invalidCredentials();

        const response = generateTokens(user?.id!);
        const refreshTokenHash = await argon2.hash(response.refreshToken);

        await this.checkSession(user?.id!, userAgent, deviceInfo);
        await AuthRepository.createSession(user?.id!, refreshTokenHash, userAgent, deviceInfo);
        return response;
    }

    static async localRefreshToken(refreshToken: string, userAgent: string, deviceInfo: string) {
        const decode = decodeToken(refreshToken, "refresh");

        const checkSession = await AuthRepository.checkSession(decode.id, userAgent, deviceInfo);
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
            await AuthRepository.deleteSession(decode.id, userAgent, deviceInfo);
        }

        if (isExpired) throw new ResponseError({
            status: 401,
            code: "REFRESH_TOKEN_EXPIRED",
            message: "Refresh token has expired",
        })

        const response = refreshAccessToken(refreshToken);
        return response;
    }

    static async logout(userId: string, userAgent: string, deviceInfo: string) {
        const checkSession = await AuthRepository.checkSession(userId, userAgent, deviceInfo);
        if (!checkSession) throw new ResponseError({
            status: 401,
            code: "NOT_LOGGED_IN",
            message: "User not logged in",
        });

        await AuthRepository.deleteSession(userId, userAgent, deviceInfo);
    }

}