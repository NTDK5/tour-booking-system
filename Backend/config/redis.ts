import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import logger from '../utils/logger';

const redisUrl = process.env.REDIS_URL;
let redis: any;

if (process.env.NODE_ENV === 'production' && redisUrl) {
    redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    });
} else {
    logger.info('Using Redis Mock for development');
    redis = new RedisMock();
    // Shim for call method which is missing in ioredis-mock but required by rate-limit-redis
    if (typeof redis.call !== 'function') {
        redis.call = async (command: string, ...args: any[]) => {
            const method = command.toLowerCase();
            if (typeof (redis as any)[method] === 'function') {
                return (redis as any)[method](...args);
            }
            throw new Error(`RedisMock command "${command}" not implemented`);
        };
    }
}

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err: any) => logger.error(`Redis Error: ${err.message}`));

export default redis;
