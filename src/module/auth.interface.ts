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
    save_password(user_id: string, password_hash: string): Promise<any>;
    get_password_hash(user_id: string): Promise<any>;
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
    logout(data: { sid: string; user_id?: string }): Promise<any>;
    // refresh_token(refresh_token: string): Promise<{ access_token: string }>;
    // verify_identifier(identifier: UserIdentifier): Promise<boolean>;
    // get_user(id: string): Promise<User | null>;
}

export interface IAuthenticationController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    // refresh_token(req: Request, res: Response, next: NextFunction): Promise<void>;
    // me(req: Request, res: Response, next: NextFunction): Promise<void>;
}
