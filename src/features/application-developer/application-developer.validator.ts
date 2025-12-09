import { z } from "zod";

export const ApplicationDeveloperFormSchema = z.object({
    id: z
        .string()
        .optional(),
    name: z
        .string()
        .min(1, "Application name is required")
        .max(150, "Application name must be less than 150 characters"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description must be less than 500 characters"),
    allowed_origins: z
        .string()
        .array()
        .optional(),
    active: z
        .boolean()
        .default(true)
        .optional(),
});