// dependencies
import type { Request, Response, NextFunction } from "express";

// validations
import Validation from "../../utils/validation";
import { ApplicationEndUserRegisterFormSchema, ApplicationEndUserLoginFormSchema } from "./application-end-user.validator";

// services
import ApplicationEndUserService from "./application-end-user.service";

// response handlers
import ResponseSuccess from "../../utils/response-success";
import ResponseError from "../../utils/response-error";

// utils
import cookieOptions from "../../utils/cookie";

export default class ApplicationEndUserController {

    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const application = (req as any).application;
            const { data } = await Validation(ApplicationEndUserRegisterFormSchema, req.body);
            const response = await ApplicationEndUserService.register(application.client_id, application.client_secret, data);
            return new ResponseSuccess({
                status: 201,
                code: "USER_CREATED",
                message: "User account created successfully",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const application = (req as any).application;
            const { data } = await Validation(ApplicationEndUserLoginFormSchema, req.body);
            const response = await ApplicationEndUserService.login(application.client_id, application.client_secret, data);

            res.cookie('client_refresh_token', response.refresh_token, cookieOptions);
            res.cookie('client_authenticated', true, cookieOptions);

            return new ResponseSuccess({
                status: 200,
                code: "USER_LOGGED_IN",
                message: "User logged in successfully",
                data: response.access_token
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies.client_refresh_token;
            if (!token) {
                throw new ResponseError({
                    status: 401,
                    code: "UNAUTHORIZED",
                    message: "Unauthorized",
                });
            }

            res.clearCookie('client_refresh_token', cookieOptions);
            res.clearCookie('client_authenticated', cookieOptions);

            return new ResponseSuccess({
                status: 200,
                code: "LOGOUT_SUCCESS",
                message: "Logout successfully",
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}