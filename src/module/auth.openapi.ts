export const authenticationOpenApi = {
    paths: {
        '/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a new user',
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
        },
    },
};
