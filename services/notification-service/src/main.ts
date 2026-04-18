import 'dotenv/config';
import { buildApp } from './app.js';

const PORT = Number(process.env['PORT'] ?? 3013);

async function main() {
  const app = await buildApp();

  await app.listen({ port: PORT, host: '0.0.0.0' });
  app.log.info(`🔔 notification-service listening on http://localhost:${PORT}`);
}

main().catch((err) => {
  console.error('Fatal error starting notification-service:', err);
  process.exit(1);
});
