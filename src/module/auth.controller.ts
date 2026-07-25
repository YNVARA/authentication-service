// dependencies
import type { Request, Response, NextFunction } from 'express';

// configuration
import { cookie_options } from '../config/cookie';
import { getLogger } from '../core/logger/request-logger';

// type
import type { IAuthenticationService } from './auth.interface';
import type { IAuthenticationController } from './auth.interface';

export class AuthenticationController implements IAuthenticationController {
    private logger = getLogger({ layer: 'controller', module: 'authentication' });

    constructor(private service: IAuthenticationService) {}

    register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const { identifier, password, first_name, last_name, is_verified } = req.body;
        const response = await this.service.register({
            identifier,
            password_hash: password,
            first_name,
            last_name,
            is_verified,
        });

        res.status(201).json({
            success: true,
            message: response.is_verified ? 'Registered successfully' : 'Please check your email for verification code',
            data: response,
        });
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const { kind, type, value, password } = req.body;
        const metadata = {
            ip: (req.headers['x-forwarded-for'] as string) || req.ip || '',
            user_agent: (req.headers['user-agent'] as string) || '',
        };

        const response = await this.service.login(
            {
                identifier: {
                    kind,
                    type: type || 'PRIMARY',
                    value,
                },
                password_hash: password,
            },
            metadata,
        );

        res.cookie('refresh_token', response.refresh_token, cookie_options);
        res.cookie('authenticated', true, cookie_options);

        res.status(200).json({
            success: true,
            data: {
                access_token: response.access_token,
            },
        });
    };

    generate_token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.cookies.refresh_token;
        const response = await this.service.generate_token({
            refresh_token: token,
        });

        res.status(200).json({
            success: true,
            data: {
                access_token: response.access_token,
            },
        });
    };

    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const user = (req as any).user;
        if (user?.session_id) {
            await this.service.logout({
                sid: user.session_id,
                user_id: user.id,
            });
        }

        res.clearCookie('refresh_token', cookie_options);
        res.clearCookie('authenticated', cookie_options);

        res.status(200).json({
            success: true,
            message: 'Logout successfully',
        });
    };
}
