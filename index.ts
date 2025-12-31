// import dependencies
import express from 'express';
import cookieParser from 'cookie-parser';

// import config
import { APP_CONFIG } from './config';


// import custom middleware
import AuthMiddleware from './middlewares/auth.middleware';
import ErrorMiddleware from './middlewares/error.middleware';


// import routes
import AuthController from './src/authentication/auth.controller';
import AccountController from './src/account/account.controller';
import CredentialController from './src/credential/credential.controller';
import EmailVerificationController from './src/email-verification/email-verification.controller';


// initialize
const app = express();


// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// authentication routes
app.post("/auth/register", AuthController.register);                                                // ✅
app.post("/auth/login", AuthController.login);                                                      // ✅
app.get("/auth/token", AuthController.token);                                                       // ✅
app.post("/auth/logout", AuthMiddleware, AuthController.logout);                                    // ✅


// email verification routes
app.post("/auth/verify-email", EmailVerificationController.emailVerification);                      // ❌
app.post("/auth/resend-email-verification", EmailVerificationController.resendEmailVerification);   // ❌


// credential routes
app.post("/auth/forgot-password", CredentialController.forgotPassword);                             // ❌
app.post("/auth/reset-password", CredentialController.resetPassword);                               // ❌
app.patch("/auth/change-password", AuthMiddleware, CredentialController.changePassword);            // ✅


// account routes
app.get("/auth/my-account", AuthMiddleware, AccountController.myAccount);                           // ✅
app.post("/auth/deactive-account", AuthMiddleware, AccountController.deactiveAccount);              // ✅
app.post("/auth/reactivate-account", AccountController.reactivateAccount);                          // ❌
app.post("/auth/delete-account", AuthMiddleware, AccountController.deleteAccount);                  // ✅


// middlewares
app.use(ErrorMiddleware);


// listener
app.listen(APP_CONFIG.PORT, () => {
    console.log(`Server started at http://${APP_CONFIG.HOST}:${APP_CONFIG.PORT}`);
});