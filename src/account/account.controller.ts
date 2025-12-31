// import dependencies
import type { Request, Response, NextFunction } from "express";

// validation & schema validation
import Validation from "../../utils/validation";
import { ConfirmDeactiveAccountSchema, ConfirmDeleteAccountSchema } from "./account.validator";

// services
import AccountService from "./account.service";

// utils
import { cookieOptions } from "../../utils/cookie";
import ResponseSuccess from "../../utils/response-success";

export default class AccountController {
    static async deactiveAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(ConfirmDeactiveAccountSchema, req.body);
            const user = (req as any).user;

            await AccountService.deactive_account({
                user_id: user.id,
                session_id: user.session_id,
                password: data.password
            });

            res.clearCookie("refresh_token", cookieOptions);
            res.clearCookie("authenticated", cookieOptions);

            return new ResponseSuccess({
                status: 200,
                code: "DEACTIVE_ACCOUNT_SUCCESS",
                message: "deactive account successful"
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async reactivateAccount(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    static async deleteAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(ConfirmDeleteAccountSchema, req.body);
            const user = (req as any).user;

            await AccountService.delete_account({
                user_id: user.id,
                session_id: user.session_id,
                password: data.password
            });

            res.clearCookie("refresh_token", cookieOptions);
            res.clearCookie("authenticated", cookieOptions);

            return new ResponseSuccess({
                status: 200,
                code: "DELETE_ACCOUNT_SUCCESS",
                message: "delete account successful"
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async myAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const response = await AccountService.get_my_profile(user.id);

            return res.status(200).json({
                status: 200,
                code: "GET_MY_ACCOUNT_SUCCESS",
                message: "get my account successful",
                data: response
            });
        } catch (error) {
            next(error);
        }
    }
}