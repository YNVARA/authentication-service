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

        if (response.mfa_required) {
            return res.status(200).json({
                success: true,
                message: 'Check your email for verification code',
            });
        }

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

    me = async (req: Request, res: Response): Promise<any> => {
        const user = (req as any).user;
        const response = await this.service.me(user.id);
        return res.status(200).json({
            success: true,
            data: response,
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

    email_verification = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const response = await this.service.email_verification({
            email: req.body.email,
            otp: req.body.otp,
        });
        return res.status(200).json({
            success: true,
            data: response,
        });
    };

    email_verification_resend = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const response = await this.service.email_verification_resend(req.body.email);
        return res.status(200).json({
            success: true,
            message: 'Please check your email for verification code',
            data: response,
        });
    };

    email_verification_status = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const response = await this.service.email_verification_status(req.body.email);
        return res.status(200).json({
            success: true,
            data: response,
        });
    };

    mfa_verify = async (req: Request, res: Response): Promise<any> => {
        const { mfa_session, token } = req.body;
        const metadata = {
            ip: (req.headers['x-forwarded-for'] as string) || req.ip || '',
            userAgent: (req.headers['user-agent'] as string) || '',
        };

        const response = await this.service.mfa_verify_session({ mfa_session, token }, metadata);

        res.cookie('refresh_token', response.refresh_token, cookie_options);
        res.cookie('authenticated', true, cookie_options);

        return res.status(200).json({
            success: true,
            data: {
                access_token: response.access_token,
            },
        });
    };

    mfa_setup_email = async (req: Request, res: Response): Promise<any> => {
        const user = (req as any).user;
        await this.service.mfa_setup_email(user.id, req.body.email);
        return res.status(200).json({
            success: true,
            message: 'MFA email setup successfully',
        });
    };

    mfa_toggle = async (req: Request, res: Response): Promise<any> => {
        const user = (req as any).user;
        await this.service.mfa_toggle(user.id, req.body.type, req.body.enabled);
        return res.status(200).json({
            success: true,
            message: `MFA ${req.body.type} ${req.body.enabled ? 'enabled' : 'disabled'} successfully`,
        });
    };
}
