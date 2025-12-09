import { z } from "zod";

export const DeveloperRegisterFormSchema = z.object({
    first_name: z
        .string()
        .min(1, "First name is required")
        .max(100, "First name must be less than 100 characters"),
    last_name: z
        .string()
        .max(100, "Last name must be less than 100 characters")
        .optional(),
    email: z
        .email({ message: "Invalid email" }),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
    confirm_password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
})

export const DeveloperLoginFormSchema = z.object({
    email: z
        .email({ message: "Invalid email" }),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
});

export const DeveloperUpdateProfileFormSchema = z.object({
    first_name: z
        .string()
        .min(1, "First name is required")
        .max(100, "First name must be less than 100 characters"),
    last_name: z
        .string()
        .max(100, "Last name must be less than 100 characters")
        .optional(),
});