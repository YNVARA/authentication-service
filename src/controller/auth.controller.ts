import type { Request, Response, NextFunction } from "express";

import Validation from "@utils/validation";
import { localRegisterSchema } from "@validation/auth.validation";
import AuthService from "@service/auth.service";
import ResponseSuccess from "@utils/response-success";

export default class AuthController {

    static async localRegister(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = Validation(localRegisterSchema, req.body);
            const create = await AuthService.localRegister(data.email, data.password);
            const response = await AuthService.addOAuthProvider(create.id, "local", create.email);

            return new ResponseSuccess({
                status: 201,
                code: "REGISTER_SUCCESS",
                message: "Register successfully",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}