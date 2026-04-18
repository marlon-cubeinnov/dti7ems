// Global setup — runs once before all tests
import * as fs from 'fs';
import * as path from 'path';

export default async function globalSetup() {
  // Ensure output directories exist
  const dirs = [
    path.join(__dirname, '../artifacts/screenshots'),
    path.join(__dirname, '../reports'),
  ];
  for (const d of dirs) fs.mkdirSync(d, { recursive: true });

  console.log('[EMS-UAT] Dual-Purpose Automation Framework initialised.');
  console.log(`[EMS-UAT] Base URL: ${process.env.BASE_URL ?? 'http://localhost:5173'}`);
}
