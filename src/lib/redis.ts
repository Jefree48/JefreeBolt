import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

// Configuración de Redis
const redisClient = new Redis({
  host: 'localhost', // Cambiar en producción
  port: 6379,
  enableOfflineQueue: false,
});

// Configuración del rate limiter para OpenAI
export const openAIRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'openai_limit',
  points: 50, // Número de peticiones permitidas
  duration: 3600, // Periodo en segundos (1 hora)
});

// Monitorización de uso de tokens
export const tokenUsageStore = {
  async incrementTokens(userId: string, tokens: number) {
    const key = `token_usage:${userId}`;
    await redisClient.hincrby(key, 'total', tokens);
    await redisClient.hincrby(key, 'daily', tokens);
    
    // Expirar el contador diario a medianoche
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const secondsUntilMidnight = Math.floor((tomorrow.getTime() - Date.now()) / 1000);
    await redisClient.expire(`${key}:daily`, secondsUntilMidnight);
  },

  async getTokenUsage(userId: string) {
    const key = `token_usage:${userId}`;
    const [total, daily] = await redisClient.hmget(key, 'total', 'daily');
    return {
      total: parseInt(total || '0'),
      daily: parseInt(daily || '0')
    };
  }
};

export default redisClient;