// dependencies
import type { Request, Response, NextFunction } from "express";

// validations
import Validation from "../../utils/validation";
import { DeveloperRegisterFormSchema, DeveloperLoginFormSchema, DeveloperUpdateProfileFormSchema } from "./developer.validator";

// services
import DeveloperService from "./developer.service";

// utils
import cookieOptions from "../../utils/cookie";

// response handlers
import ResponseSuccess from "../../utils/response-success";
import ResponseError from "../../utils/response-error";

export default class DeveloperController {

    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(DeveloperRegisterFormSchema, req.body);
            const response = await DeveloperService.register(data);
            return new ResponseSuccess({
                status: 201,
                code: "DEVELOPER_CREATED",
                message: "Developer account created successfully",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(DeveloperLoginFormSchema, req.body);
            const response = await DeveloperService.login(data);

            res.cookie('refresh_token', response.refresh_token, cookieOptions);
            res.cookie('authenticated', true, cookieOptions);

            return new ResponseSuccess({
                status: 200,
                code: "DEVELOPER_LOGGED_IN",
                message: "Developer logged in successfully",
                data: response.access_token,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }


    static async getToken(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies.refresh_token;
            const respone = await DeveloperService.getToken(token);
            return new ResponseSuccess({
                status: 200,
                code: "GET_TOKEN_SUCCESS",
                message: "get token successfully",
                data: respone,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async profile(req: Request, res: Response, next: NextFunction) {
        try {
            const developer = (req as any).user;
            const response = await DeveloperService.getProfile(developer.id);
            return new ResponseSuccess({
                status: 200,
                code: "GET_PROFILE_SUCCESS",
                message: "get profile successfully",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }


    static async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(DeveloperUpdateProfileFormSchema, req.body);
            const developer = (req as any).user;
            const response = await DeveloperService.updateProfile(developer.id, data);
            return new ResponseSuccess({
                status: 200,
                code: "UPDATE_PROFILE_SUCCESS",
                message: "update profile successfully",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }


    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies.refresh_token;
            if (!token) {
                throw new ResponseError({
                    status: 401,
                    code: "UNAUTHORIZED",
                    message: "Unauthorized",
                });
            }

            res.clearCookie('refresh_token', cookieOptions);
            res.clearCookie('authenticated', cookieOptions);

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