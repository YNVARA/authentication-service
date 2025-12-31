// import dependencies
import argon2 from "argon2";

// import repository
import AuthRepository from "./auth.repository";

// import utils
import ResponseError from "../../utils/response-error";
import { generate_tokens, refreshAccessToken } from "../../utils/jwt";
import { redis } from "../../utils/redis";

// service for handle authentication
export default class AuthService {

    static async register(data: {
        email: string,
        username: string,
        password: string,
        confirm_password: string
    }) {
        const emailExists = await AuthRepository.count_email(data.email);
        const usernameExists = await AuthRepository.count_username(data.username);

        if (emailExists > 0 || usernameExists > 0) {
            throw new ResponseError({
                status: 409,
                code: "ACCOUNT_ALREADY_EXISTS",
                message: "An account with the provided credentials already exists."
            });
        }

        if (data.password !== data.confirm_password) {
            throw new ResponseError({
                status: 400,
                code: "PASSWORD_MISMATCH",
                message: "Passwords do not match."
            });
        }

        const hash_password = await argon2.hash(data.password);

        const payload = {
            email: data.email,
            username: data.username,
            hash_password: hash_password
        };

        return await AuthRepository.create_user(payload);
    }

    static async login(data: {
        email_or_username: string,
        password: string,
        ip: string,
        ua: string
    }) {
        // find user
        const response = await AuthRepository.login(data);
        if (!response) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid email/username or password."
        });

        // validate password
        const is_password_valid = await argon2.verify(response.hash_password, data.password);
        if (!is_password_valid) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid email/username or password."
        });

        // validate status
        switch (response.status) {
            case "pending":
                throw new ResponseError({
                    status: 403,
                    code: "ACCOUNT_PENDING",
                    message: "Your account is pending verification. Please verify your email."
                });

            case "suspend":
                throw new ResponseError({
                    status: 403,
                    code: "ACCOUNT_SUSPENDED",
                    message: "Your account has been suspended. Please contact support."
                });

            case "inactive":
                throw new ResponseError({
                    status: 403,
                    code: "ACCOUNT_INACTIVE",
                    message: "Your account is inactive. Please contact support."
                });

            case "deleted":
                throw new ResponseError({
                    status: 410,
                    code: "ACCOUNT_DELETED",
                    message: "This account has been permanently deleted."
                });

            case "active":
                break;

            default:
                throw new ResponseError({
                    status: 403,
                    code: "ACCOUNT_INVALID_STATE",
                    message: "Account is in an invalid state."
                });
        }

        // validate email verification
        if (!response.email_verified_at) {
            throw new ResponseError({
                status: 403,
                code: "EMAIL_NOT_VERIFIED",
                message: "Please verify your email before logging in."
            });
        }

        // update last login
        await AuthRepository.update_last_login(response.id);

        // create token
        const token = generate_tokens(response.id);

        // create session
        const ttl = 60 * 60 * 24 * 7;
        const redis_payload = {
            sid: token.session_id,
            user_id: response.id,
            ip: data.ip,
            user_agent: data.ua
        }
        await redis.set(`session:${token.session_id}`, JSON.stringify(redis_payload), "EX", ttl);

        // return token
        return {
            access_token: token.access_token,
            refresh_token: token.refresh_token
        };
    }

    static async refresh_token(token: string) {
        const response = await refreshAccessToken(token);
        return response;
    }

    static async logout(sid: string) {
        const session = await redis.get(`session:${sid}`);

        if (!session) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Invalid session. Please login again."
            });
        }

        let payload: any;
        try {
            payload = JSON.parse(session);
        } catch {
            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Invalid session. Please login again."
            });
        }

        await redis.del(`session:${sid}`);
        return payload;
    }

}