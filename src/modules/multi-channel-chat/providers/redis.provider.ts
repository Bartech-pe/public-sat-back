import { Provider } from '@nestjs/common';
import { redisConfig } from 'config/env';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    const redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
    });
    redis.on('connect', (err) => {
      console.error('Redis is Ready', err);
    });
    redis.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    return redis;
  },
};
