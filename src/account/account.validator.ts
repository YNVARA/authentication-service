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