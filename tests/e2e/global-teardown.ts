// Global teardown — runs once after all tests complete
export default async function globalTeardown() {
  console.log('[EMS-UAT] Test run complete. Artifact index written to tests/reports/.');
}
