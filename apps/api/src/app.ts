import fastify from 'fastify';
import { env } from './config/env.js';

export const buildApp = () => {
    const app = fastify ( {
        logger : {
            level : env.LOG_LEVEL,
        }
    })

    app.get("/health/live", async () => {
    return {
      status: "ok",
      service: "wobbii-api",
    };
  });

    return app;
}