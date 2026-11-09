import {env} from './config/env.js'; 
import { buildApp } from './app.js';

const app = buildApp();

async function start() {
    try {
        await app.listen({ port: env.PORT, host: env.HOST });
        app.log.info(`Server listening on ${env.HOST}:${env.PORT}`);
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

async function stop() {
    try{
        app.log.info('Server stopped');
        await app.close();
        process.exit(0);
    }catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
