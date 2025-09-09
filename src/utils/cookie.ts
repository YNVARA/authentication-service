import { AUTH_SERVICE_ENV, AUTH_SERVICE_DOMAIN } from "@config";

const cookieOptions: any = {
    httpOnly: true,
    secure: AUTH_SERVICE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
};

if (AUTH_SERVICE_ENV === 'production' && AUTH_SERVICE_DOMAIN) {
    cookieOptions.domain = AUTH_SERVICE_DOMAIN;
}

export default cookieOptions;