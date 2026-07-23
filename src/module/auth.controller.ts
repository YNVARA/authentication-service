// dependencies
import type { Request, Response, NextFunction } from 'express';

// configuration
import { cookie_options } from '../config/cookie';
import { getLogger } from '../core/logger/request-logger';

// type
import type { RegisterUserRequest } from './auth.interface';
import type { IAuthenticationService } from './auth.interface';
import type { IAuthenticationController } from './auth.interface';

export class AuthenticationController implements IAuthenticationController {
    private logger = getLogger({ layer: 'controller', module: 'authentication' });

    constructor(private service: IAuthenticationService) {}

    register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const { password, confirm_password, agree, ...rest } = req.body;
        const data: RegisterUserRequest = {
            ...rest,
            password_hash: password,
        };
        const response = await this.service.register(data);

        return res.status(201).json({
            success: true,
            message: data.is_verified ? 'Registered successfully' : 'Please check your email for verification code',
            data: response,
        });
    };
}
