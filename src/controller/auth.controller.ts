import type { Request, Response, NextFunction } from "express";
import { UAParser } from "ua-parser-js";

import Validation from "@utils/validation";
import cookieOptions from "@utils/cookie";

import { localRegisterSchema, localLoginSchema, getTokenForgotPasswordSchema, resetPasswordSchema } from "@validation/auth.validation";
import AuthService from "@service/auth.service";
import ResponseSuccess from "@utils/response-success";

export default class AuthController {

    static async localRegister(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = Validation(localRegisterSchema, req.body);
            const response = await AuthService.localRegister(data.email, data.password);

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
            const deviceInfo = new UAParser(req.headers['user-agent'] || "unknown").getDevice().type || "desktop";

            const { data } = Validation(localLoginSchema, req.body);
            const response = await AuthService.localLogin(data.email, data.password, userAgent, deviceInfo);

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

    static async localRefreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refresh_token;
            const userAgent = req.headers['user-agent'] || "unknown";
            const deviceInfo = new UAParser(req.headers['user-agent'] || "unknown").getDevice().type || "desktop";
            const response = await AuthService.localRefreshToken(refreshToken, userAgent, deviceInfo);

            return new ResponseSuccess({
                status: 200,
                code: "REFRESH_TOKEN_SUCCESS",
                message: "Refresh token successfully",
                data: {
                    token: response
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies.refresh_token;
            const userAgent = req.headers['user-agent'] || "unknown";
            const deviceInfo = new UAParser(req.headers['user-agent'] || "unknown").getDevice().type || "desktop";
            const response = await AuthService.logout(token, userAgent, deviceInfo);

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