import { env } from './env';

export const cookie_options: any = {
    httpOnly: true,
    secure: env.app.environment === 'production',
    sameSite: 'lax',
    path: '/',
};

// set cookie domain when production
if (env.app.environment === 'production' && env.app.domain) {
    cookie_options.domain = env.app.domain;
}
