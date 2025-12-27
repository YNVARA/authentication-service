// import dependencies
import type { Request, Response, NextFunction } from "express";

// validation & schema validation
import Validation from "../../utils/validation";
import { RegisterSchema, LoginSchema } from "./auth.validator";

// services
import AuthService from "./auth.service";

// response
import ResponseSuccess from "../../utils/response-success";

// initialize class for authentication controller
export default class AuthController {

    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(RegisterSchema, req.body);
            const response = await AuthService.register(data);
            return new ResponseSuccess({
                status: 201,
                code: "REGISTRATION_SUCCESS",
                message: "registration successful. We have sent a verification link to your email. Please verify your account to continue.",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(LoginSchema, req.body);

            const ip = (req.ip || '').replace('::ffff:', '');
            const ua = req.get('User-Agent') || '';
            const payload = {...data, ip, ua}

            const response = await AuthService.login(payload);
            return new ResponseSuccess({
                status: 200,
                code: "LOGIN_SUCCESS",
                message: "login successful",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async token(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    static async emailVerification(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    static async resendEmailVerification(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

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

        } catch (error) {
            next(error);
        }
    }

    static async deactiveAccount(req: Request, res: Response, next: NextFunction) {
        try {

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

        } catch (error) {
            next(error);
        }
    }
}