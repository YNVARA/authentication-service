import cookieParser from 'cookie-parser';
import express from 'express';

import AuthMiddleware from "@middleware/auth.middleware";
import ErrorMiddleware from "@middleware/error.middleware";
import NotFoundMiddleware from "@middleware/not-found.middleware";

import AuthController from "./controller/auth.controller";

export const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/auth/register', AuthController.localRegister);
app.post('/auth/login', AuthController.localLogin);
app.post('/auth/refresh', AuthController.localRefreshToken);
app.post('/auth/logout', AuthMiddleware, AuthController.logout);

app.use(ErrorMiddleware);
app.use(NotFoundMiddleware);