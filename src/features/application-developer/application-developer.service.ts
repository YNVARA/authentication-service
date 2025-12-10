// repositories
import ApplicationDeveloperRepository from "./application-developer.repository";

// types
import type { ApplicationDeveloperFormRequest } from "./application-developer.type";

// response handler
import ResponseError from "../../utils/response-error";

export default class AppliactionDeveloperService {

    static async create_application_by_developer_id(developer_id: string | number, data: ApplicationDeveloperFormRequest) {
        const app_by_name_and_developer_id_is_exist = await ApplicationDeveloperRepository.appliaction_by_name_and_developer_id_is_exists(data.name, developer_id);
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

        const response = await ApplicationDeveloperRepository.create_application_developer_id(developer_id, data);
        return response;
    }

    static async update_client_secret_by_application_id_and_developer_id(application_id: string | number, developer_id: string | number) {
        const existing_application = await ApplicationDeveloperRepository.find_application_by_id_and_developer_id(application_id, developer_id);
        if (!existing_application) {
            throw new ResponseError({
                status: 404,
                code: "APPLICATION_NOT_FOUND",
                message: "Application not found",
            });
        }
        
        const response = await ApplicationDeveloperRepository.update_client_secret_by_application_id_and_developer_id(application_id, developer_id);
        return response;
    }

    static async update_application_by_id_and_developer_id(developer_id: string | number, application_id: string | number, data: ApplicationDeveloperFormRequest) {
        const existing_application = await ApplicationDeveloperRepository.find_application_by_id_and_developer_id(application_id, developer_id);
        if (!existing_application) {
            throw new ResponseError({
                status: 404,
                code: "APPLICATION_NOT_FOUND",
                message: "Application not found",
            });
        }

        if (data.allowed_origins && Array.isArray(data.allowed_origins)) {
            data.allowed_origins = data.allowed_origins.map(origin => origin.trim()).filter(origin => origin !== "" && origin !== "*");
        } else {
            data.allowed_origins = [];
        }

        const response = await ApplicationDeveloperRepository.update_application_by_id_and_developer_id(application_id, developer_id, data);
        return response;
    }

    static async get_all_application_by_developer_id(developer_id: string | number) {
        const response = await ApplicationDeveloperRepository.get_all_application_by_developer_id(developer_id);
        return response;
    }

    static async get_application_by_id_and_developer_id(application_id: string | number, developer_id: string | number) {
        const response = await ApplicationDeveloperRepository.get_application_by_id_and_developer_id(application_id, developer_id);
        if (!response) {
            throw new ResponseError({
                status: 404,
                code: "APPLICATION_NOT_FOUND",
                message: "Application not found",
            });
        }

        return response;
    }

    static async delete_application_by_id_and_developer_id(application_id: string | number, developer_id: string | number) {
        const existing_application = await ApplicationDeveloperRepository.find_application_by_id_and_developer_id(application_id, developer_id);
        if (!existing_application) {
            throw new ResponseError({
                status: 404,
                code: "APPLICATION_NOT_FOUND",
                message: "Application not found",
            });
        }
        const response = await ApplicationDeveloperRepository.delete_application_by_id_and_developer_id(application_id, developer_id);
        return response;
    }

}