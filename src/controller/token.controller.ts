import { UAParser } from "ua-parser-js";
import type { Request, Response, NextFunction } from "express";

import TokenService from "@service/token.service";
import ResponseSuccess from "@utils/response-success";

export default class TokenController {

    static async GetToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refresh_token;
            const userAgent = req.headers['user-agent'] || "unknown";
            const deviceInfo = new UAParser(req.headers['user-agent'] || "unknown").getDevice().type || "desktop";
            const response = await TokenService.getToken(refreshToken, userAgent, deviceInfo);

            return new ResponseSuccess({
                status: 200,
                code: "REFRESH_TOKEN_SUCCESS",
                message: "Refresh token successfully",
                data: {
                    token: response
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}