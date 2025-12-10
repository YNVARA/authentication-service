// dependencies
import type { Request, Response, NextFunction } from "express";

// validator
import { ApplicationDeveloperFormSchema } from "./application-developer.validator";

// service
import AppliactionDeveloperService from "./application-developer.service";

// utils
import Validation from "../../utils/validation";
import ResponseSuccess from "../../utils/response-success";

export default class ApplicationDeveloperController {

    static async create_application_by_developer_id(req: Request, res: Response, next: NextFunction) {
        try {
            const developer = (req as any).user;
            const { data } = await Validation(ApplicationDeveloperFormSchema, req.body);
            const response = await AppliactionDeveloperService.create_application_by_developer_id(developer.id, data);
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

    static async update_client_secret_by_application_id_and_developer_id(req: Request, res: Response, next: NextFunction) {
        try {
            const developer = (req as any).user;
            const { application_id } = req.params;
            const response = await AppliactionDeveloperService.update_client_secret_by_application_id_and_developer_id(application_id as string | number, developer.id);
            return new ResponseSuccess({
                status: 200,
                code: "CLIENT_SECRET_UPDATED",
                message: "Client secret updated successfully",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async update_application_by_id_and_developer_id(req: Request, res: Response, next: NextFunction) {
        try {
            const developer = (req as any).user;
            const { application_id } = req.params;
            const { data } = await Validation(ApplicationDeveloperFormSchema, req.body);
            const response = await AppliactionDeveloperService.update_application_by_id_and_developer_id(developer.id, application_id as string | number, data);
            return new ResponseSuccess({
                status: 200,
                code: "APPLICATION_UPDATED",
                message: "Application updated successfully",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async get_all_application_by_developer_id(req: Request, res: Response, next: NextFunction) {
        try {
            const developer = (req as any).user;
            const response = await AppliactionDeveloperService.get_all_application_by_developer_id(developer.id);
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

    static async get_application_by_id_and_developer_id(req: Request, res: Response, next: NextFunction) {
        try {
            const developer = (req as any).user;
            const { application_id } = req.params;
            const response = await AppliactionDeveloperService.get_application_by_id_and_developer_id(application_id as string | number, developer.id);
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

    static async delete_application_by_id_and_developer_id(req: Request, res: Response, next: NextFunction) {
        try {
            const developer = (req as any).user;
            const { application_id } = req.params;
            const response = await AppliactionDeveloperService.delete_application_by_id_and_developer_id(application_id as string | number, developer.id);
            return new ResponseSuccess({
                status: 200,
                code: "APPLICATION_DELETED",
                message: "Application deleted successfully",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }

    }

}