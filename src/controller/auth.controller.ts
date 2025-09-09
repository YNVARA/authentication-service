import type { Request, Response, NextFunction } from "express";
import { UAParser } from "ua-parser-js";

import Validation from "@utils/validation";
import { localRegisterSchema, localLoginSchema } from "@validation/auth.validation";
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

    static async localLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const userAgent = req.headers['user-agent'] || "unknown";
            const parser = new (UAParser as any)();
            parser.setUA(userAgent);
            const deviceInfo = parser.getDevice().type || "desktop";

            const { data } = Validation(localLoginSchema, req.body);
            const response = await AuthService.localLogin(data.email, data.password, userAgent, deviceInfo);

            return new ResponseSuccess({
                status: 200,
                code: "LOGIN_SUCCESS",
                message: "Login successfully",
                data: {
                    token : response
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}