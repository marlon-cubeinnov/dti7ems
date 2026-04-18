import 'dotenv/config';
import { buildApp } from './app.js';

const PORT = Number(process.env['PORT'] ?? 3001);
const HOST = process.env['NODE_ENV'] === 'production' ? '0.0.0.0' : '127.0.0.1';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Identity Service listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
