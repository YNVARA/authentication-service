import { z } from "zod";

export const RegisterSchema = z.object({
    email: z
        .email({ message: "invalid email" }),
    username: z
        .string()
        .min(3, { message: "username must be at least 3 characters long" })
        .max(30, { message: "username must be at most 30 characters long" })
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: "username may only contain letters, numbers, and underscore"
        }),
    password: z
        .string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(30, { message: "password must be at most 30 characters long" }),
    confirm_password: z
        .string()
        .min(6, { message: "confirm password must be at least 6 characters long" })
        .max(30, { message: "confirm password must be at most 30 characters long" }),
}).refine((data) => data.password === data.confirm_password, {
    message: "passwords do not match"
});

export const LoginSchema = z.object({
    email_or_username: z
        .string()
        .min(3, { message: "email or username must be at least 3 characters long" }),
    password: z
        .string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(30, { message: "password must be at most 30 characters long" }),
});