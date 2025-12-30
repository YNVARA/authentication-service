import { z } from "zod";

export const ChangePasswordSchema = z
    .object({
        old_password: z
            .string()
            .min(6, { message: "password must be at least 6 characters long" })
            .max(30, { message: "password must be at most 30 characters long" }),
        new_password: z
            .string()
            .min(6, { message: "password must be at least 6 characters long" })
            .max(30, { message: "password must be at most 30 characters long" })
            .regex(/[A-Z]/, "must contain an uppercase letter")
            .regex(/[a-z]/, "must contain a lowercase letter")
            .regex(/[0-9]/, "must contain a number")
            .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
        confirm_password: z.string()
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"]
    });
