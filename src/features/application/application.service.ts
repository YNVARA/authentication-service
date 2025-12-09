// repositories
import ApplicationRepository from "./application.repository";

// types
import type { ApplicationFormRequest } from "./application.type";

// response handler
import ResponseError from "../../utils/response-error";

export default class AppliactionService {

    static async createApplication(developer_id: string | number, data: ApplicationFormRequest) {
        const app_by_name_and_developer_id_is_exist = await ApplicationRepository.appliaction_by_name_and_developer_id_is_exists(data.name, developer_id);
        if (app_by_name_and_developer_id_is_exist) {
            throw new ResponseError({
                status: 409,
                code: "APPLICATION_NAME_ALREADY_EXISTS",
                message: "The application name is already used by you. Please choose a different name.",
                details: { name: data.name },
            });
        }

        if (data.allowed_origins && Array.isArray(data.allowed_origins)) {
            data.allowed_origins = data.allowed_origins.map(origin => origin.trim()).filter(origin => origin !== "" && origin !== "*");
        } else {
            data.allowed_origins = [];
        }

        const response = await ApplicationRepository.create_application(developer_id, data);
        return response;
    }

    static async getAllApplicationByDeveloperId(developer_id: string | number) {
        const response = await ApplicationRepository.get_all_application_by_developer_id(developer_id);
        return response;
    }

    static async getApplicationById(application_id: string | number) {
        const response = await ApplicationRepository.get_application_by_id(application_id);
        if (!response) {
            throw new ResponseError({
                status: 404,
                code: "APPLICATION_NOT_FOUND",
                message: "Application not found",
            });
        }

        return response;
    }

}