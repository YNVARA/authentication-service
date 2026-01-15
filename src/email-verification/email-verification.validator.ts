import { z } from "zod";

export const ResendEmailVerificationSchema = z
    .object({
        email: z
            .email({ message: "invalid email" }),
    });

export const EmailVerificationSchema = z
    .object({
        email: z
            .email({ message: "invalid email" }),
    });