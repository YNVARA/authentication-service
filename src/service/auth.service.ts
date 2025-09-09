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

    static async addOAuthProvider(userId: string, provider: string, providerUserId: string){
        const response = await AuthRepository.addOAuthProvider(userId, provider, providerUserId);
        return response;
    }

}