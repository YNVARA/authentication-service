import express from 'express';

import ErrorMiddleware from "@middleware/error.middleware";
import NotFoundMiddleware from "@middleware/not-found.middleware";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(ErrorMiddleware);
app.use(NotFoundMiddleware);