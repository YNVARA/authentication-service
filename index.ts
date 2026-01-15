// import dependencies
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

// import configs and initializers
import { APP_CONFIG } from "./config";
import { initDatabase } from "./database.init";

// import middlewares
import AuthMiddleware from "./middlewares/auth.middleware";
import ErrorMiddleware from "./middlewares/error.middleware";

// import utils
import limiter from "./utils/rate-limit";

// import controllers
import AccountController from "./src/account/account.controller";
import AuthController from "./src/authentication/auth.controller";
import CredentialController from "./src/credential/credential.controller";
import EmailVerificationController from "./src/email-verification/email-verification.controller";

// initialize
async function bootstrap() {
    await initDatabase();

    const app = express();

    app.use(cors());
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Authentication
    app.post("/auth/register", limiter(10, 30), AuthController.register);
    app.post("/auth/login", limiter(1, 5), AuthController.login);
    app.get("/auth/token", limiter(1, 20), AuthController.token);
    app.post("/auth/logout", limiter(1, 30), AuthMiddleware, AuthController.logout);

    // Email verification
    app.post("/auth/verify-email", EmailVerificationController.emailVerification);
    app.post("/auth/resend-email-verification", limiter(1, 1), EmailVerificationController.resendEmailVerification);

    // Credentials
    app.post("/auth/forgot-password", CredentialController.forgotPassword);
    app.post("/auth/reset-password", CredentialController.resetPassword);
    app.patch("/auth/change-password", AuthMiddleware, CredentialController.changePassword);

    // Account
    app.get("/auth/my-account", AuthMiddleware, AccountController.myAccount);
    app.post("/auth/deactive-account", AuthMiddleware, AccountController.deactiveAccount);
    app.post("/auth/reactivate-account", AccountController.reactivateAccount);
    app.post("/auth/delete-account", AuthMiddleware, AccountController.deleteAccount);
    app.patch("/auth/update-username", AuthMiddleware, AccountController.updateUsername);

    app.use(ErrorMiddleware);

    app.listen(APP_CONFIG.PORT, () => {
        console.log(`🚀 Server running at http://${APP_CONFIG.HOST}:${APP_CONFIG.PORT}`);
    });
}

bootstrap().catch(err => {
    console.error("❌ Fatal startup error:", err);
    process.exit(1);
});
