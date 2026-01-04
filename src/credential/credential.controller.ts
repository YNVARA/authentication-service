// import dependencies
import type { Request, Response, NextFunction } from "express";

// validation & schema validation
import Validation from "../../utils/validation";
import { ChangePasswordSchema } from "./credential.validator";

// services
import CredentialService from "./credential.service";

// utils
import ResponseSuccess from "../../utils/response-success";

export default class CredentialController {
    static async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(ChangePasswordSchema, req.body);
            const user = (req as any).user;

            await CredentialService.change_password({
                public_user_id: user.public_id,
                old_password: data.old_password,
                new_password: data.new_password
            });


            return new ResponseSuccess({
                status: 200,
                code: "CHANGE_PASSWORD_SUCCESS",
                message: "Password changed successfully"
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
}