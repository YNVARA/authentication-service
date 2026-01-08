// import repositories
import EmailVerificationRepository from "./email-verification.repository";

// import utils
import ResponseError from "../../utils/response-error";

// service for email verification
export default class EmailVerificationService {

    static async verify_email(data: { token_hash: string }) {
        const token = await EmailVerificationRepository.get_token_data(data.token_hash);
        const user = await EmailVerificationRepository.get_data_user_by_user_id_on_email_verification_token(token.user_id);

        if (token.expires_at < new Date()) {
            throw new ResponseError({
                status: 400,
                code: "INVALID_TOKEN",
                message: "invalid token, please resend email"
            });
        }

        if (token.user_id !== user.id) {
            throw new ResponseError({
                status: 400,
                code: "TOKEN_USER_MISMATCH",
                message: "token does not match with user"
            });
        }

        if (token.used_at !== null) {
            throw new ResponseError({
                status: 400,
                code: "TOKEN_ALREADY_USED",
                message: "token has already been used"
            });
        }

        if (user.status === "active" && user.email_verified_at !== null) {
            throw new ResponseError({
                status: 400,
                code: "EMAIL_ALREADY_VERIFIED",
                message: "email is already verified"
            });
        }

        const response = await EmailVerificationRepository.update_user_email_verification_and_status(token.user_id);
        return response;
    }

}