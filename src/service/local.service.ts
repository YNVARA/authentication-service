import argon2 from "argon2";

import UserRepository from "@repository/user.repository";
import LocalAuthRepository from "@repository/local.repository";
import ProviderRepository from "@repository/provider.repository";
import SessionRepository from "@repository/session.repository";

import ResponseError from "@utils/response-error";
import { generateTokens, decodeToken } from "@utils/jwt";

export default class LocalAuthService {

    static async register(email: string, password: string) {
        const passwordHash = await argon2.hash(password);
        const email_is_taken = await UserRepository.isEmailTaken(email);

        if (email_is_taken) throw new ResponseError({
            status: 400,
            code: "EMAIL_TAKEN",
            message: "Email already taken",
            details: {
                email: email
            }
        });

        const reponse = await LocalAuthRepository.register(email, passwordHash);
        return reponse;
    }

    static async login(email: string, password: string, userAgent: string, deviceInfo: string) {
        const user = await LocalAuthRepository.login(email);
        if (!user) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials",
            details: {
                email: email
            }
        });

        const is_password_match = await argon2.verify(user.passwordHash!, password);
        if (!is_password_match) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials",
            details: {
                email: email
            }
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