// environment
import { APP_ENVIRONMENT } from "../config";

const cookieOptions: any = {
    httpOnly: true,
    secure: APP_ENVIRONMENT === 'production',
    sameSite: 'lax',
    path: '/',
};

// if (APP_ENVIRONMENT === 'production' && AUTH_SERVICE_DOMAIN) {
//     cookieOptions.domain = AUTH_SERVICE_DOMAIN;
// }

export default cookieOptions;