// library
import express from 'express';
import cookieParser from 'cookie-parser';

// import middlewares
import ErrorMiddleware from './middlewares/error.middleware';
import AuthMiddleware from "./middlewares/auth.middleware";

// import utils
import limiter from './utils/rate-limit';

// import controllers
import { DeveloperController, ApplicationDeveloperController } from './features';

// initialize
const app = express();

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------------------------------
// authentication routes (developer)
// -------------------------------------------------------------------------------
// - register 
// - login 
// - get token 
// - get profile 
// - update profile 
// - logout
// -------------------------------------------------------------------------------
app.post('/dev/register', limiter(1, 5), DeveloperController.register);
app.post('/dev/login', limiter(1, 5), DeveloperController.login);
app.get('/dev/token', limiter(5, 5), DeveloperController.getToken);
app.get('/dev/profile', AuthMiddleware, DeveloperController.profile);
app.patch('/dev/profile', AuthMiddleware, DeveloperController.updateProfile);
app.delete('/dev/logout', DeveloperController.logout);

// -------------------------------------------------------------------------------
// application routes (developer)
// -------------------------------------------------------------------------------
// - create application by developer id
// - get all applications by developer id
// - get application by id and developer id
// - update application by id and developer id
// - delete application by id and developer id
// -------------------------------------------------------------------------------
app.post('/dev/applications', AuthMiddleware, ApplicationDeveloperController.create_application_by_developer_id);
app.get('/dev/applications', AuthMiddleware, ApplicationDeveloperController.get_all_application_by_developer_id);
app.get('/dev/applications/:application_id', AuthMiddleware, ApplicationDeveloperController.get_application_by_id_and_developer_id);
app.patch('/dev/applications/:application_id', AuthMiddleware, ApplicationDeveloperController.update_application_by_id_and_developer_id);
app.delete('/dev/applications/:application_id', AuthMiddleware, ApplicationDeveloperController.delete_application_by_id_and_developer_id);

// -------------------------------------------------------------------------------
// application authentication routes (developer) - on going
// -------------------------------------------------------------------------------
// - app register account end user
// - app login account end user
// - app logout account end user
// - app get token account end user
// - app get profile account
// - app update profile account
// - app delete account
// -------------------------------------------------------------------------------

// middlewares
app.use(ErrorMiddleware);

// export default
export default app;