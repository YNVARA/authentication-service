// import dependencies
import express from 'express';

// import config
import { APP_CONFIG } from './config';


// import routes
import WellcomeContainer from './src/wellcome/container';
import AuthController from './src/authentication/controller';


// initialize
const app = express();


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// routes
app.get("/", WellcomeContainer.index);

app.post("/auth/register", AuthController.register);
app.post("/auth/login", AuthController.login);
app.get("/auth/token", AuthController.token);
app.post("/auth/logout", AuthController.logout);
app.post("/auth/verify-email", AuthController.emailVerification);
app.post("/auth/resend-email-verification", AuthController.resendEmailVerification);
app.post("/auth/forgot-password", AuthController.forgotPassword);
app.post("/auth/reset-password", AuthController.resetPassword);
app.post("/auth/change-password", AuthController.changePassword);
app.post("/auth/deactive-account", AuthController.deactiveAccount);
app.post("/auth/reactivate-account", AuthController.reactivateAccount);
app.post("/auth/delete-account", AuthController.deleteAccount);


// listener
app.listen(APP_CONFIG.PORT, () => {
    console.log(`Server started at http://${APP_CONFIG.HOST}:${APP_CONFIG.PORT}`);
});