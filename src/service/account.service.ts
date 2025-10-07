import argon2 from "argon2";

import UserRepository from "@repository/user.repository";

import ResponseError from "@utils/response-error";

export default class AccountService {

    static async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await UserRepository.findUserById(userId);
        if (!user) throw new ResponseError({
            status: 404,
            code: "USER_NOT_FOUND",
            message: "User not found"
        });

        const is_password_match = await argon2.verify(user.passwordHash!, oldPassword);
        if (!is_password_match) throw new ResponseError({
            status: 400,
            code: "INVALID_PASSWORD",
            message: "Wrong password"
        });

        const passwordHash = await argon2.hash(newPassword);
        const response = await UserRepository.changePasswordById(userId, passwordHash!);
        return response;
    }

}