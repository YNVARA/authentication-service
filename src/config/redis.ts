import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redisClient = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
});

redisClient.on('connect', () => {
    logger.info('Redis connected');
});

redisClient.on('error', (error: unknown) => {
    logger.error({ error }, 'Redis connection error');
});

export const connectRedis = async () => {
    if (redisClient.status !== 'ready') {
        await redisClient.connect();
    }
};

export const closeRedis = async () => {
    if (redisClient.status !== 'end') {
        await redisClient.quit();
    }
};
