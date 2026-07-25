export const authenticationOpenApi = {
    paths: {
        '/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RegisterRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'User registered successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthSuccessResponse' },
                            },
                        },
                    },
                    '409': { description: 'User already exists' },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Login',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LocalLoginRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Login successful or MFA required',
                        content: {
                            'application/json': {
                                schema: {
                                    oneOf: [{ $ref: '#/components/schemas/LoginResponse' }, { $ref: '#/components/schemas/MfaRequiredResponse' }],
                                },
                            },
                        },
                    },
                    '401': { description: 'Invalid credentials' },
                },
            },
        },
        '/auth/token': {
            get: {
                tags: ['Authentication'],
                summary: 'Refresh token',
                responses: {
                    '200': {
                        description: 'Token refreshed',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                access_token: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/auth/me': {
            get: {
                tags: ['Authentication'],
                summary: 'Get user profile',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'User profile retrieved',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/auth/logout': {
            post: {
                tags: ['Authentication'],
                summary: 'Logout',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Logged out successfully' },
                },
            },
        },
        '/auth/verify/email': {
            post: {
                tags: ['Email Verification'],
                summary: 'Verify user email with OTP',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmailVerifyRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Email verified successfully' },
                    '400': { description: 'Invalid or expired token' },
                },
            },
        },
        '/auth/verify/email/status': {
            post: {
                tags: ['Email Verification'],
                summary: 'Check email verification status',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                },
                                required: ['email'],
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Status retrieved' },
                },
            },
        },
        '/auth/verify/email/resend': {
            post: {
                tags: ['Email Verification'],
                summary: 'Resend verification email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                },
                                required: ['email'],
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Verification email sent' },
                },
            },
        },
    },
    components: {
        schemas: {
            RegisterRequest: {
                type: 'object',
                required: ['identifier', 'password', 'confirm_password'],
                properties: {
                    first_name: { type: 'string' },
                    last_name: { type: 'string' },
                    identifier: {
                        type: 'object',
                        required: ['kind', 'value'],
                        properties: {
                            kind: { type: 'string', enum: ['EMAIL', 'PHONE', 'USERNAME', 'CUSTOM'] },
                            value: { type: 'string' },
                            type: { type: 'string', default: 'PRIMARY' },
                        },
                    },
                    password: { type: 'string', minLength: 8 },
                    confirm_password: { type: 'string' },
                    is_verified: { type: 'boolean', default: false },
                },
            },
            LocalLoginRequest: {
                type: 'object',
                required: ['value', 'password'],
                properties: {
                    kind: { type: 'string', enum: ['EMAIL', 'PHONE', 'USERNAME', 'CUSTOM'], default: 'EMAIL' },
                    type: { type: 'string', default: 'PRIMARY' },
                    value: { type: 'string' },
                    password: { type: 'string' },
                },
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: {
                        type: 'object',
                        properties: {
                            access_token: { type: 'string' },
                        },
                    },
                },
            },
            EmailVerifyRequest: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    otp: { type: 'string' },
                },
            },
        },
    },
};
