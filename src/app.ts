// library
import express from 'express';
import cookieParser from 'cookie-parser';

// import middlewares
import ErrorMiddleware from './middlewares/error.middleware';
import AuthMiddleware from "./middlewares/auth.middleware";

// import utils
import limiter from './utils/rate-limit';

// import controllers
import { DeveloperController } from './features';

// initialize
const app = express();

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.post('/dev/register', limiter(1, 5), DeveloperController.register);
app.post('/dev/login', limiter(1, 5), DeveloperController.login);
app.get('/dev/token', limiter(5, 5), DeveloperController.getToken);
app.get('/dev/profile', AuthMiddleware, DeveloperController.profile);
app.patch('/dev/profile', AuthMiddleware, DeveloperController.updateProfile);
app.delete('/dev/logout', DeveloperController.logout);

// middlewares
app.use(ErrorMiddleware);

// export default
export default app;