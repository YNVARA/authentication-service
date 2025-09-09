import express from 'express';

import ErrorMiddleware from "@middleware/error.middleware";
import NotFoundMiddleware from "@middleware/not-found.middleware";

import AuthController from "./controller/auth.controller";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/auth/register', AuthController.localRegister);
app.post('/auth/login', AuthController.localLogin);

app.use(ErrorMiddleware);
app.use(NotFoundMiddleware);