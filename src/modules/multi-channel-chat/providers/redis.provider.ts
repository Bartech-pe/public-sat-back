import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    const redis = new Redis({
		host: '127.0.0.1',
		port: 6379,
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
