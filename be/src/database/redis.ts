import Redis from 'ioredis';
import { logger } from '@shared';
export const redis = new Redis({ keyPrefix: 'fun_api' });

const TEST = "TEST";
redis.set(TEST, 'bar');
redis.get(TEST, (err) => {
    if (err) { throw err; }
    logger.info('redis 连接成功');
});
redis.del(TEST);
