export type DeveloperRegisterFormRequest = {
    first_name: string;
    last_name?: string;
    email: string;
    password: string;
}

export type DeveloperLoginFormRequest = {
    email: string;
    password: string;
}

export type DeveloperProfileUpdateFormRequest = {
    first_name: string;
    last_name?: string;
}