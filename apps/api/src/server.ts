import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = buildApp();

async function start() {
  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(`Wobbii API running on port ${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
}

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;

  shuttingDown = true;
  app.log.info({ signal }, "Graceful shutdown started");

  try {
    await app.close();
  } catch (error) {
    app.log.error(error, "Shutdown failed");
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

void start();
