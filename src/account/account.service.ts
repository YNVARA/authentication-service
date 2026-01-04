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
        public_user_id: string,
        session_id: string,
        password: string
    }) {
        const password_user = await AccountRepository.password_validation_by_user_id(data.public_user_id);
        const is_password_valid = await argon2.verify(password_user.hash_password, data.password);

        if (!is_password_valid) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid password."
        });

        const response = await AccountRepository.update_status_user({
            public_user_id: data.public_user_id,
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
            public_user_id: data.user_id,
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

    static async get_my_profile(user_id: string | number) {
        const response = await AccountRepository.get_my_account(user_id);
        return response;
    }

    static async update_username(data: {
        user_id: string | number,
        username: string
    }) {
        const current = await AccountRepository.check_current_username(data.user_id)
        if (current.username === data.username) {
            throw new ResponseError({
                status: 400,
                code: "USERNAME_SAME",
                message: "new username must be different."
            });
        }

        const exist = await AccountRepository.username_is_exist(data.username);
        if (exist) {
            throw new ResponseError({
                status: 409,
                code: "USERNAME_TAKEN",
                message: "Username already in use."
            });
        }

        return await AccountRepository.update_username({
            user_id: data.user_id,
            username: data.username
        });
    }

}