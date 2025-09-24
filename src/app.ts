import cookieParser from 'cookie-parser';
import express from 'express';

import limiter from "@utils/rate-limit";

import AuthMiddleware from "@middleware/auth.middleware";
import ErrorMiddleware from "@middleware/error.middleware";
import NotFoundMiddleware from "@middleware/not-found.middleware";

import AuthController from "@controller/auth.controller";
import SessionController from "@controller/session.controller";

export const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/auth/register', AuthController.localRegister);
app.post('/auth/login', AuthController.localLogin);
app.post('/auth/refresh', limiter(4, 3), AuthController.localRefreshToken);
app.post('/auth/logout', AuthController.logout);

app.get('/session', AuthMiddleware, SessionController.getAllSession);
app.delete('/session/:id', AuthMiddleware, SessionController.deleteSession);

app.use(ErrorMiddleware);
app.use(NotFoundMiddleware);