import { z } from "zod";

export const RegisterSchema = z.object({
    email: z
        .email({ message: "invalid email" }),
    username: z
        .string()
        .min(3, { message: "username must be at least 3 characters long" })
        .max(30, { message: "username must be at most 30 characters long" })
        .regex(/^[a-z0-9_]+$/, {
            message: "username may only contain lowercase letters, numbers, and underscore"
        })
        .refine(v => /^[a-z]/.test(v), {
            message: "username must start with a letter"
        })
        .refine(v => !v.endsWith("_"), {
            message: "username must not end with underscore"
        })
        .refine(v => !v.includes("__"), {
            message: "username must not contain consecutive underscores"
        })
        .refine(v => !["admin", "root", "support", "system"].some(w => v.includes(w)), {
            message: "this username is reserved"
        }),
    password: z
        .string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(30, { message: "password must be at most 30 characters long" })
        .regex(/[A-Z]/, "must contain an uppercase letter")
        .regex(/[a-z]/, "must contain a lowercase letter")
        .regex(/[0-9]/, "must contain a number")
        .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
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