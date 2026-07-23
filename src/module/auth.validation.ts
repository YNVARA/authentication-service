import { z } from 'zod';

const passwordSchema = z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, {
        message: 'Password must contain at least one special character',
    });

export const registerSchema = z.object({
    body: z
        .object({
            identifier: z.object({
                kind: z.enum(['EMAIL', 'PHONE', 'USERNAME', 'CUSTOM']),
                value: z.string().trim().min(1),
                type: z.string().trim().default('PRIMARY'),
            }),
            password: passwordSchema,
            confirm_password: z.string().min(1, { message: 'Please confirm your password' }),
            first_name: z.string().trim().min(1).optional(),
            last_name: z.string().trim().optional(),
            is_verified: z.boolean().optional(),
            agree: z
                .boolean()
                .optional()
                .refine((val) => val === true, {
                    message: 'You must agree to the terms and conditions',
                }),
        })
        .refine((data) => data.password === data.confirm_password, {
            message: 'Passwords do not match',
            path: ['confirm_password'],
        }),
});
