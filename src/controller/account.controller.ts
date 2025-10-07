import type { Request, Response, NextFunction } from "express";

import Validation from "@utils/validation";
import { changePasswordSchema } from "@validation/account.validation";

import AccountService from "@service/account.service";
import ResponseSuccess from "@utils/response-success";

export default class AccountController {

    static async ChangePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const { data } = Validation(changePasswordSchema, req.body);
            const response = await AccountService.changePassword(user.id, data.oldPassword, data.newPassword);

            return new ResponseSuccess({
                status: 200,
                code: "CHANGE_PASSWORD_SUCCESS",
                message: "Change password successfully",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}