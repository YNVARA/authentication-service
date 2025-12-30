// import dependencies
import type { Request, Response, NextFunction } from "express";

export default class AccountController {
    static async deactiveAccount(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    static async reactivateAccount(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    static async deleteAccount(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    static async myAccount(req: Request, res: Response, next: NextFunction) {
        try {
            return res.status(200).json({
                status: 200,
                code: "TOKEN_SUCCESS",
                message: "token successful",
                data: "token successful"
            });
        } catch (error) {
            next(error);
        }
    }
}