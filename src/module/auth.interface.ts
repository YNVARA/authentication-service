import type { Request, Response, NextFunction } from 'express';

export interface IAuthenticationRepository {
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
}

export interface IAuthenticationService {
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
}

export interface IAuthenticationController {
    register(req: Request, res: Response, next: NextFunction): Promise<any>;
    login(req: Request, res: Response, next: NextFunction): Promise<any>;
    generate_token(req: Request, res: Response, next: NextFunction): Promise<any>;
    me(req: Request, res: Response): Promise<any>;
    logout(req: Request, res: Response, next: NextFunction): Promise<any>;
}
