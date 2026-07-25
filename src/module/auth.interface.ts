import type { Request, Response, NextFunction } from 'express';

export interface IAuthenticationRepository {
    // authentication
    create_user(data: {
        identifier: {
            kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM';
            value: string;
            type: string;
        };
        password_hash: string;
        first_name?: string;
        last_name?: string;
        is_verified?: boolean;
    }): Promise<any>;
    exists_identifier(data: { kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM'; value: string; type: string }): Promise<boolean>;
    find_by_identifier(data: { kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM'; value: string; type: string }): Promise<any>;
    find_by_id(id: string): Promise<any>;

    // verified
    verify_identifier(data: { user_id: string; kind: string; value: string }): Promise<any>;

    // multi-factor
    get_multi_facator_methods(user_id: string): Promise<any[]>;
    upsert_multi_factor_method(user_id: string, data: { type: 'EMAIL' | 'TOTP' | 'SMS'; secret?: string; is_enabled?: boolean }): Promise<any>;
    verify_multi_factor_method(user_id: string, type: string): Promise<any>;
}

export interface IAuthenticationService {
    // authentication
    register(data: {
        identifier: {
            kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM';
            value: string;
            type: string;
        };
        password_hash: string;
        first_name?: string;
        last_name?: string;
        is_verified?: boolean;
    }): Promise<any>;
    login(
        data: {
            identifier: {
                kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM';
                value: string;
                type: string;
            };
            password_hash: string;
        },
        metadata?: { ip?: string; user_agent?: string },
    ): Promise<any>;
    generate_token(data: { refresh_token: string }): Promise<any>;
    me(user_id: string): Promise<any>;
    logout(data: { sid: string; user_id?: string }): Promise<any>;

    // email verification
    email_verification(data: { email: string; otp: string }): Promise<any>;
    email_verification_resend(email: string): Promise<any>;
    email_verification_status(email: string): Promise<any>;

    // multi-factor
    // mfa_verify(data: { user_id: string; token: string; type: string }): Promise<any>;
    mfa_verify_session(data: { mfa_session: string; token: string }, metadata?: { ip?: string; user_agent?: string }): Promise<any>;
    mfa_setup_email(user_id: string, email: string): Promise<void>;
    mfa_toggle(user_id: string, type: string, enabled: boolean): Promise<void>;
}

export interface IAuthenticationController {
    // authentication
    register(req: Request, res: Response, next: NextFunction): Promise<any>;
    login(req: Request, res: Response, next: NextFunction): Promise<any>;
    generate_token(req: Request, res: Response, next: NextFunction): Promise<any>;
    me(req: Request, res: Response): Promise<any>;
    logout(req: Request, res: Response, next: NextFunction): Promise<any>;

    // email verification
    email_verification(req: Request, res: Response, next: NextFunction): Promise<any>;
    email_verification_resend(req: Request, res: Response, next: NextFunction): Promise<any>;
    email_verification_status(req: Request, res: Response, next: NextFunction): Promise<any>;

    // multi-factor
    mfa_verify(req: Request, res: Response, next: NextFunction): Promise<any>;
    mfa_setup_email(req: Request, res: Response, next: NextFunction): Promise<any>;
    mfa_toggle(req: Request, res: Response, next: NextFunction): Promise<any>;
}
