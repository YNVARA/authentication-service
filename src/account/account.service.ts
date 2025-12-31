// import dependencies
import argon2 from "argon2";

// import repository
import AccountRepository from "./account.repository";

// import utils
import ResponseError from "../../utils/response-error";
import { redis } from "../../utils/redis";

// service for account management
export default class AccountService {

    static async deactive_account(data: {
        user_id: string,
        session_id: string,
        password: string
    }) {
        const password_user = await AccountRepository.password_validation_by_user_id(data.user_id);
        const is_password_valid = await argon2.verify(password_user.hash_password, data.password);

        if (!is_password_valid) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid password."
        });

        const response = await AccountRepository.update_status_user({
            user_id: data.user_id,
            status: "inactive"
        });

        const session = await redis.get(`session:${data.session_id}`);

        if (!session) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Invalid session. Please login again."
            });
        }

        await redis.del(`session:${data.session_id}`);
        return response;
    }

    static async delete_account(data: {
        user_id: string,
        session_id: string,
        password: string
    }) {
        const password_user = await AccountRepository.password_validation_by_user_id(data.user_id);
        const is_password_valid = await argon2.verify(password_user.hash_password, data.password);

        if (!is_password_valid) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid password."
        });

        const response = await AccountRepository.update_status_user({
            user_id: data.user_id,
            status: "deleted"
        });

        const session = await redis.get(`session:${data.session_id}`);

        if (!session) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Invalid session. Please login again."
            });
        }

        await redis.del(`session:${data.session_id}`);
        return response;
    }

}