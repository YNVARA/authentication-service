// dependencies
import type { Response, Request, NextFunction } from "express";

// database
import pg from "../database/pg";

// response handlers
import ResponseError from "../utils/response-error";

export default async function AppMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const client_id = req.headers.client_id as string;
        const client_secret = req.headers.client_secret as string;

        if (!client_id || !client_secret) {
            throw new ResponseError({
                "status": 401,
                "code": "MISSING_CLIENT_CREDENTIALS",
                "message": "Client credentials are required"
            })
        }

        const query = `SELECT * FROM applications WHERE client_id = $1 AND client_secret = $2`;
        const values = [client_id, client_secret];
        const result = await pg.query(query, values);

        if (result.rows.length === 0) {
            throw new ResponseError({
                "status": 401,
                "code": "INVALID_CLIENT_CREDENTIALS",
                "message": "Invalid client credentials"
            })
        }

        (req as any).application = {
            client_id: result.rows[0].client_id,
            client_secret: result.rows[0].client_secret
        }
        next();
    } catch (error) {
        next(error);
    }
}