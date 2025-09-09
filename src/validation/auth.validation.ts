import { email, z } from "zod";

export const localRegisterSchema = z.object({
    email: z.email({ message: "Invalid email" }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const localLoginSchema = z.object({
    email: z.email({ message: "Invalid email" }),
    password: z.string().min(8, "Password must be at least 8 characters"),
})