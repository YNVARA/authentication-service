// dependencies
import argon2 from "argon2";

// response handlers
import ResponseError from "../../utils/response-error";

// types
import type { DeveloperRegisterFormRequest, DeveloperLoginFormRequest, DeveloperProfileUpdateFormRequest } from "./developer.type";

// repository
import DeveloperRepository from "./developer.repository";

// utils
import { generateTokens, refreshAccessToken } from "../../utils/jwt";

export default class DeveloperService {

    static async register(data: DeveloperRegisterFormRequest) {
        const email_exist = await DeveloperRepository.email_exists(data.email);
        if (email_exist) {
            throw new ResponseError({
                status: 409,
                code: "EMAIL_ALREADY_EXISTS",
                message: "The provided email is already registered",
                details: { email: data.email },
            });
        }

        const password_hash = await argon2.hash(data.password);
        data.password = password_hash;

        const response = await DeveloperRepository.create_developer_account(data);
        return response;
    }

    static async login(data: DeveloperLoginFormRequest) {
        const developer = await DeveloperRepository.get_developer_by_email(data.email);
        if (!developer) {
            throw new ResponseError({
                status: 404,
                code: "DEVELOPER_NOT_FOUND",
                message: "Developer account not found",
                details: { email: data.email },
            });
        }

        const password_valid = await argon2.verify(developer.password_hash, data.password);
        if (!password_valid) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_PASSWORD",
                message: "Invalid password",
                details: { email: data.email },
            });
        }

        const response = await generateTokens(developer.id);
        return response;
    }

    static async getToken(token: string) {
        const response = await refreshAccessToken(token);
        return response;
    }

    static async getProfile(developer_id: string | number) {
        const response = await DeveloperRepository.get_developer_profile(developer_id);

        if (!response) {
            throw new ResponseError({
                status: 404,
                code: "DEVELOPER_NOT_FOUND",
                message: "Developer account not found",
                details: { developer_id: developer_id },
            });
        }

        return response;
    }

    static async updateProfile(developer_id: string | number, data: DeveloperProfileUpdateFormRequest) {
        const response = await DeveloperRepository.update_developer_profile(developer_id, data);
        return response;
    }
}