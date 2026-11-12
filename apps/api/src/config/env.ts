import { z } from 'zod';
import "dotenv/config";

const envSchema = z.object({
    NODE_ENV : z.enum(['development', 'production', 'test']).default('development'),
    PORT : z.coerce.number().default(3000),
    HOST : z.string().default('0.0.0.0'),
    LOG_LEVEL : z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
    DATABASE_URL : z.string().min(1),
    JWT_SECRET : z.string().min(16),
})

export const env = envSchema.parse(process.env);