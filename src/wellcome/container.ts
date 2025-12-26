import type { Request, Response, NextFunction } from "express";

export default class WellcomeContainer {

    static async index(req: Request, res: Response, next: NextFunction) {
        try {
            return res.status(200).json({
                message: "hello world"
            });
        } catch (error) {
            next(error);
        }
    }

}