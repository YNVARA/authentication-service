import type { Request, Response, NextFunction } from "express";
import SessionService from "@service/session.service";
import ResponseSuccess from "@utils/response-success";

export default class SessionController {
    
    static async getAllSession(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const response = await SessionService.getAllSession(user.id);

            return new ResponseSuccess({
                status: 200,
                code: "GET_ALL_SESSION_SUCCESS",
                message: "Get all session successfully",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async deleteSession(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const response = await SessionService.deleteSession(id as string);

            return new ResponseSuccess({
                status: 200,
                code: "DELETE_SESSION_SUCCESS",
                message: "Delete session successfully",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}