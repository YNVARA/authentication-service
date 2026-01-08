import { z } from "zod";

export const ResendEmailVerificationSchema = z
    .object({
        email: z
            .email({ message: "invalid email" }),
    });

export const EmailVerificationSchema = z
    .object({
        token: z
            .string()
            .min(10, { message: "invalid token" }),
    });