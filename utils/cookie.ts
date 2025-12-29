// import config
import { APP_CONFIG } from "../config";

// initialize cookie configuration
export const cookieOptions: any = {
    httpOnly: true,
    secure: APP_CONFIG.ENVIRONMENT === 'production',
    sameSite: 'lax',
    path: '/',
};

// set cookie domain when production
if (APP_CONFIG.ENVIRONMENT === 'production' && APP_CONFIG.DOMAIN) {
    cookieOptions.domain = APP_CONFIG.DOMAIN;
}