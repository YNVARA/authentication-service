// dependencies
import type { Request, Response, NextFunction } from "express";

// validator
import { ApplicationFormSchema } from "./application.validator";

// service
import AppliactionService from "./application.service";

// utils
import Validation from "../../utils/validation";
import ResponseSuccess from "../../utils/response-success";

export default class ApplicationController {

    static async createApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const developer = (req as any).user;
            const { data } = await Validation(ApplicationFormSchema, req.body);
            const response = await AppliactionService.createApplication(developer.id, data);
            return new ResponseSuccess({
                status: 201,
                code: "APPLICATION_CREATED",
                message: "Application created successfully",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async getAllApplicationByDeveloperId(req: Request, res: Response, next: NextFunction) {
        try {
            const developer = (req as any).user;
            const response = await AppliactionService.getAllApplicationByDeveloperId(developer.id);
            return new ResponseSuccess({
                status: 200,
                code: "APPLICATIONS_FETCHED",
                message: "Applications fetched successfully",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async getApplicationById(req: Request, res: Response, next: NextFunction) {
        try {
            const { application_id } = req.params;
            const response = await AppliactionService.getApplicationById(application_id as string | number);
            return new ResponseSuccess({
                status: 200,
                code: "APPLICATION_FETCHED",
                message: "Application fetched successfully",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}