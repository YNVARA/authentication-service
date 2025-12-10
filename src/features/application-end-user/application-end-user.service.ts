// dependencies
import argon2 from "argon2";

// repositories
import ApplicationEndUserRepository from "./application-end-user.repository";

// response handlers
import ResponseError from "../../utils/response-error";

// types
import type { ApplicationEndUserRegisterFormRequest } from './application-end-user.type';

export default class ApplicationEndUserService {

    static async register(client_id: string, client_secret: string, data: ApplicationEndUserRegisterFormRequest) {
        const application = await ApplicationEndUserRepository.find_application_by_client_id_and_client_secret(client_id, client_secret);
        if (!application) {
            throw new ResponseError({
                "status": 404,
                "code": "APPLICATION_NOT_FOUND",
                "message": "Application not found"
            })
        }

        const user_email = await ApplicationEndUserRepository.find_email_by_application_id(application.id, data.email);
        if (user_email) {
            throw new ResponseError({
                "status": 409,
                "code": "EMAIL_ALREADY_EXISTS",
                "message": "Email already exists"
            })
        }

        const password_hash = await argon2.hash(data.password);
        data.password = password_hash;

        const response = await ApplicationEndUserRepository.create_new_user(application.id, data);
        return response;
    }

}