import type { Request, Response, NextFunction } from "express";
import ResponseError from "@utils/response-error";

export default function NotFoundMiddleware(req: Request, res: Response, next: NextFunction) {
    return res.status(404).json(new ResponseError({
        status: 404,
        message: `Route ${req.originalUrl} not found`,
        code: "NOT_FOUND",
        details: {
            method: req.method,
            path: req.originalUrl
        }
    }));
}