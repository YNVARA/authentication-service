// import dependencies
import type { Request, Response, NextFunction } from "express";

// import services
import EmailVerificationService from "./email-verification.service";

// import validators
import { ResendEmailVerificationSchema } from "./email-verification.validator";

// utils
import ResponseSuccess from "../../utils/response-success";
import Validation from "../../utils/validation";

export default class EmailVerificationController {
    static async emailVerification(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = req.query;
            await EmailVerificationService.verify_email({ token: String(token) });
            return new ResponseSuccess({
                status: 200,
                code: "EMAIL_VERIFICATION_SUCCESS",
                message: "email verification successful"
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async resendEmailVerification(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(ResendEmailVerificationSchema, req.body);
            await EmailVerificationService.resend_verification_email({ email: data.email });
            return new ResponseSuccess({
                status: 200,
                code: "RESEND_EMAIL_VERIFICATION_SUCCESS",
                message: "the request has been processed. Please check your inbox for a verification message.",
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
}