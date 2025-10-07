// libray
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';

// limiter
import limiter from "@utils/rate-limit";

// middleware
import AuthMiddleware from "@middleware/auth.middleware";
import ErrorMiddleware from "@middleware/error.middleware";
import NotFoundMiddleware from "@middleware/not-found.middleware";

// controllers
import AccountController from '@controller/account.controller';
import TokenController from '@controller/token.controller';
import LocalAuthController from '@controller/local.controller';
import SessionController from "@controller/session.controller";

// config
import {AUTH_ALLOWED_ORIGINS} from "@config";

// init
export const app = express();

// setup cors
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (AUTH_ALLOWED_ORIGINS.includes(origin)) { return callback(null, true); }
        else { return callback(new Error('Not allowed by CORS')); }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));

// setup main middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// endpoint for local auth management (login, register, logout)
app.post('/auth/local/register', LocalAuthController.Register);
app.post('/auth/local/login', LocalAuthController.Login);
app.post('/auth/local/logout', LocalAuthController.Logout);

// endpoint for token
app.post('/auth/refresh', limiter(4, 3), TokenController.GetToken);

// endpoint for account management
app.patch('/account/password', AuthMiddleware, AccountController.ChangePassword);

// endpoint for session
app.get('/session', AuthMiddleware, SessionController.getAllSession);
app.delete('/session/:id', AuthMiddleware, SessionController.deleteSession);

// setup error middleware
app.use(ErrorMiddleware);
app.use(NotFoundMiddleware);