// dependencies
import type { Request, Response, NextFunction } from "express";

// validations
import Validation from "../../utils/validation";
import { ApplicationEndUserRegisterFormSchema } from "./application-end-user.validator";

// services
import ApplicationEndUserService from "./application-end-user.service";

// response handlers
import ResponseSuccess from "../../utils/response-success";

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

}