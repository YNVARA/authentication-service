import argon2 from "argon2";

import UserRepository from "@repository/user.repository";
import ProviderRepository from "@repository/provider.repository";
import SessionRepository from "@repository/session.repository";

import ResponseError from "@utils/response-error";
import { generateTokens, decodeToken, refreshAccessToken } from "@utils/jwt";

export default class AuthService {

    static async isEmailTaken(email: string) {
        const response = await UserRepository.isEmailTaken(email);
        if (response) throw new ResponseError({
            status: 400,
            code: "EMAIL_TAKEN",
            message: "Email already taken"
        });
    }

    static async createProvider(userId: string, provider: string, providerUserId: string) {
        const response = await ProviderRepository.createProvider(userId, provider, providerUserId);
        return response;
    }

    static async localRegister(email: string, password: string) {
        await this.isEmailTaken(email);
        const passwordHash = await argon2.hash(password);
        const localResgister = await UserRepository.register(email, passwordHash);
        await this.createProvider(localResgister.id, "local", email);
        return localResgister;
    }

    static async localLogin(email: string, password: string, userAgent: string, deviceInfo: string) {
        const user = await UserRepository.login(email);
        if (!user) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials",
        });

        const isPasswordMatch = await argon2.verify(user.passwordHash!, password);
        if (!isPasswordMatch) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials",
        });

        const provider = await ProviderRepository.getProvider(user.id, "local");
        if (!provider || provider.providerUserId !== email) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials",
        });

        const session = await SessionRepository.checkSession(user.id, userAgent, deviceInfo);
        if (session) throw new ResponseError({
            status: 401,
            code: "USER_ALREADY_LOGGED_IN",
            message: "User already logged in",
        });
        
        const response = generateTokens(user?.id!);
        const refreshTokenHash = await argon2.hash(response.refreshToken);
        
        await SessionRepository.createSession(user?.id!, refreshTokenHash, userAgent, deviceInfo);
        return response;
    }

    static async localRefreshToken(refreshToken: string, userAgent: string, deviceInfo: string) {
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

    static async logout(token: string, userAgent: string, deviceInfo: string) {
        const decoded = decodeToken(token);
        const checkSession = await SessionRepository.checkSession(decoded.id, userAgent, deviceInfo);
        if (!checkSession) throw new ResponseError({
            status: 401,
            code: "NOT_LOGGED_IN",
            message: "User not logged in",
        });

        await SessionRepository.deleteSession(decoded.id, userAgent, deviceInfo);
    }

}