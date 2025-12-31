import { z } from "zod";

export const ConfirmDeactiveAccountSchema = z.object({
    password: z
        .string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(30, { message: "password must be at most 30 characters long" }),
});

export const ConfirmDeleteAccountSchema = z.object({
    password: z
        .string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(30, { message: "password must be at most 30 characters long" }),
});

export const UpdateUsernameSchema = z.object({
    username: z
        .string()
        .min(4, { message: "username must be at least 4 characters long" })
        .max(20, { message: "username must be at most 20 characters long" })
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
});