// import dependencies
import argon2 from "argon2";

// import repository
import CredentialRepository from "./credential.repository";

// import utils
import ResponseError from "../../utils/response-error";

// service for credential management
export default class CredentialService {

    static async change_password(data : {
        public_user_id: string,
        old_password: string,
        new_password: string
    }){
        const old_password_data = await CredentialRepository.validation_old_password(data.public_user_id);
        const is_old_password_valid = await argon2.verify(old_password_data.hash_password, data.old_password);

        if (!is_old_password_valid) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid old password."
        });

        const hash_password = await argon2.hash(data.new_password);
        return await CredentialRepository.update_password({
            public_user_id: data.public_user_id,
            hash_password: hash_password
        });
    }

}