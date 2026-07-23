// dependencies
import type { Express } from 'express';

// core
import type { Module } from '../core/module';

// init
import { AuthenticationRepository } from './auth.repository';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import { AuthenticationRoutes } from './auth.routes';

export const authenticationModule: Module = {
    name: 'authentication',

    register: (app: Express, container) => {
        const database = container.db.get('main');

        const repository = new AuthenticationRepository(database);
        const service = new AuthenticationService(repository, container);
        const controller = new AuthenticationController(service);
        const routes = new AuthenticationRoutes(controller);

        app.use('/auth', routes.router());
    },

    async onInit(container) {
        container.logger.info({ module: 'authentication' }, 'Authentication module initialized');
    },

    async onDestroy(container) {
        container.logger.info({ module: 'authentication' }, 'Authentication module destroyed');
    },
};
