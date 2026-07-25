import { apiReference } from '@scalar/express-api-reference';
import type { Express } from 'express';
import { env } from './env';

// docs
import { authenticationOpenApi } from '../module/auth.openapi';

export const setupOpenApi = (app: Express) => {
    const openApiSpecification = {
        openapi: '3.0.0',
        info: {
            title: `${env.app.name} API`,
            version: env.app.version,
            description: 'Enterprise Core API Documentation',
        },
        servers: [
            {
                url: `http://${env.app.hostname}:${env.app.port}`,
                description: 'Local server',
            },
        ],
        paths: {
            '/health': {
                get: {
                    tags: ['System'],
                    summary: 'Health check',
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
            ...authenticationOpenApi.paths,
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                ...authenticationOpenApi.components.schemas,
            },
        },
    };

    app.use(
        '/docs',
        apiReference({
            spec: {
                content: openApiSpecification,
            },
            theme: 'purple',
            layout: 'modern',
        }),
    );
};
