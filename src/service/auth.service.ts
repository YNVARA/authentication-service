import argon2 from "argon2";

import AuthRepository from "@repository/auth.repository";
import ResponseError from "@utils/response-error";

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

    static async localLogin(email: string, password: string) {
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

        return user;
    }

}