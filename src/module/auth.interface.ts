import type { Request, Response, NextFunction } from 'express';

export type IdentifierKind = 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM';

export interface UserIdentifier {
    kind: IdentifierKind;
    value: string;
    type: string;
}

export interface User {
    id: string;
    identifier: UserIdentifier;
    first_name?: string;
    last_name?: string;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface RegisterUserRequest {
    identifier: UserIdentifier;
    password_hash: string;
    first_name?: string;
    last_name?: string;
}

export interface LoginRequest {
    identifier: UserIdentifier;
    password_hash: string;
}

export interface IAuthenticationRepository {
    create_user(data: RegisterUserRequest): Promise<User>;
    exists_identifier(identifier: UserIdentifier): Promise<boolean>;
    find_by_identifier(identifier: UserIdentifier): Promise<User | null>;
    find_by_id(id: string): Promise<User | null>;
    save_password(user_id: string, password_hash: string): Promise<void>;
    get_password_hash(user_id: string): Promise<string | null>;
}

export interface IAuthenticationService {
    register(data: RegisterUserRequest): Promise<User>;
    login(data: LoginRequest): Promise<{
        user: User;
        access_token: string;
        refresh_token: string;
    }>;
    refresh_token(refresh_token: string): Promise<{ access_token: string }>;
    logout(user_id: string): Promise<void>;
    verify_identifier(identifier: UserIdentifier): Promise<boolean>;
    get_user(id: string): Promise<User | null>;
}

export interface IAuthenticationController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    refresh_token(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    me(req: Request, res: Response, next: NextFunction): Promise<void>;
}
