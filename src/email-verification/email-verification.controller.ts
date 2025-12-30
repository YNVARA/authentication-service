// import dependencies
import type { Request, Response, NextFunction } from "express";

export default class EmailVerificationController {
    static async emailVerification(req: Request, res: Response, next: NextFunction) {
        try {

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