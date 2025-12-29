// import dependencies
import type { Request, Response, NextFunction } from "express";

// validation & schema validation
import Validation from "../../utils/validation";
import { RegisterSchema, LoginSchema } from "./auth.validator";

// services
import AuthService from "./auth.service";

// utils
import { redis } from "../../utils/redis";
import { decode_token } from "../../utils/jwt";
import { cookieOptions } from "../../utils/cookie";
import ResponseSuccess from "../../utils/response-success";
import ResponseError from "../../utils/response-error";

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
            const payload = { ...data, ip, ua }

            const response = await AuthService.login(payload);
            res.cookie('refresh_token', response.refresh_token, cookieOptions);
            res.cookie('authenticated', true, cookieOptions);

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
        let decoded: any = null;

        try {
            const token = req.cookies.refresh_token;
            const response = await AuthService.refresh_token(token);
            return new ResponseSuccess({
                status: 200,
                code: "GET_TOKEN_SUCCESS",
                message: "get token successful",
                data: {
                    access_token: response
                }
            }).send(res);
        } catch (error) {
            if (error instanceof ResponseError) {
                const destroySessionErrors = [
                    "INVALID_REFRESH_TOKEN",
                    "SESSION_INVALID",
                    "ACCOUNT_NOT_ACTIVE",
                    "REFRESH_TOKEN_EXPIRED"
                ];

                if (error.code && destroySessionErrors.includes(error.code)) {
                    try {
                        decoded = decode_token(req.cookies.refresh_token, "refresh");
                    } catch { }

                    if (decoded?.sid) {
                        await redis.del(`session:${decoded.sid}`);
                    }

                    res.clearCookie("refresh_token", cookieOptions);
                    res.clearCookie("authenticated", cookieOptions);
                }
            }

            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            await AuthService.logout(user.session_id);

            res.clearCookie("refresh_token", cookieOptions);
            res.clearCookie("authenticated", cookieOptions);

            return new ResponseSuccess({
                status: 200,
                code: "LOGOUT_SUCCESS",
                message: "Logout successful."
            }).send(res);

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

    static async myAccount(req: Request, res: Response, next: NextFunction) {
        try {
            return res.status(200).json({
                status: 200,
                code: "TOKEN_SUCCESS",
                message: "token successful",
                data: "token successful"
            });
        } catch (error) {
            next(error);
        }
    }
}