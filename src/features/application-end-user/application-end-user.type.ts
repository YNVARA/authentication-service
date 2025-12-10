export type ApplicationEndUserRegisterFormRequest = {
    first_name: string;
    last_name?: string;
    email: string;
    password: string;
}

export type ApplicationEndUserLoginRequest = {
    email: string;
    password: string;
}