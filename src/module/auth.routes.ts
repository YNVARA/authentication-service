// dependencies
import { Router } from 'express';

// core and shared
import { asyncHandler } from '../core/http/async-handler';
import { validate } from '../shared/middleware/validate.middleware';

// validation and middleware
import { registerSchema, loginSchema } from './auth.validation';
import authMiddleware from '../shared/middleware/auth.middleware';

// interface
import type { IAuthenticationController } from './auth.interface';

export class AuthenticationRoutes {
    constructor(private controller: IAuthenticationController) {}

    router() {
        const router = Router();

        router.post('/register', validate(registerSchema), asyncHandler(this.controller.register));
        router.post('/login', validate(loginSchema), asyncHandler(this.controller.login));
        router.post('/logout', authMiddleware, asyncHandler(this.controller.logout));

        return router;
    }
}
