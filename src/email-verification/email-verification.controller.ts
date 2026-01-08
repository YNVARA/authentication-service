// import dependencies
import type { Request, Response, NextFunction } from "express";

// import services
import EmailVerificationService from "./email-verification.service";

// utils
import ResponseSuccess from "../../utils/response-success";

export default class EmailVerificationController {
    static async emailVerification(req: Request, res: Response, next: NextFunction) {
        try {
            const { token_hash } = req.query;
            await EmailVerificationService.verify_email({ token_hash: String(token_hash) });
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

        } catch (error) {
            next(error);
        }
    }
}