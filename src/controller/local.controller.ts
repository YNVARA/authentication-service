import { UAParser } from "ua-parser-js";
import type { Request, Response, NextFunction } from "express";

import cookieOptions from "@utils/cookie";
import Validation from "@utils/validation";
import { localRegisterSchema, localLoginSchema } from "@validation/local.validation";

import LocalAuthService from "@service/local.service";
import ResponseSuccess from "@utils/response-success";

export default class LocalAuthController {

    static async Register(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = Validation(localRegisterSchema, req.body);
            const response = await LocalAuthService.register(data.email, data.password);

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

    static async Login(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = Validation(localLoginSchema, req.body);
            const userAgent = req.headers['user-agent'] || "unknown";
            const deviceInfo = new UAParser(req.headers['user-agent'] || "unknown").getDevice().type || "desktop";

            const response = await LocalAuthService.login(data.email, data.password, userAgent, deviceInfo);

            res.cookie('refresh_token', response.refreshToken, cookieOptions);
            res.cookie('authenticated', true, cookieOptions);

            return new ResponseSuccess({
                status: 200,
                code: "LOGIN_SUCCESS",
                message: "Login successfully",
                data: {
                    token: response.accessToken
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async Logout(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies.refresh_token;
            const userAgent = req.headers['user-agent'] || "unknown";
            const deviceInfo = new UAParser(req.headers['user-agent'] || "unknown").getDevice().type || "desktop";
            const response = await LocalAuthService.logout(token, userAgent, deviceInfo);

            res.clearCookie('refresh_token', cookieOptions);
            res.clearCookie('authenticated', cookieOptions);

            return new ResponseSuccess({
                status: 200,
                code: "LOGOUT_SUCCESS",
                message: "Logout successfully",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}