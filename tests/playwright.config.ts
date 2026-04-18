import { defineConfig, devices } from '@playwright/test';

/**
 * Dual-Purpose Automation Framework — Playwright Configuration
 * DTI Region 7 Event Management System
 *
 * Two projects:
 *  1. uat-capture    — Full UAT run: takes screenshots, builds artifact index + evidence book
 *  2. visual-regression — PR guard: pixel-diff against baselines, fails on unexpected diffs
 */

const BASE_URL  = process.env.BASE_URL  ?? 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL ?? 'http://localhost:5174';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,   // Sequential — runner builds ordered artifact index
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,             // Single worker for ordered UAT journeys
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'en-PH',
    timezoneId: 'Asia/Manila',
  },

  projects: [
    {
      name: 'uat-capture',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        screenshot: 'on',   // Always capture for artifact index
      },
      testMatch: '**/*.spec.ts',
    },
    {
      name: 'visual-regression',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        screenshot: 'only-on-failure',
      },
      testMatch: '**/*.spec.ts',
      snapshotPathTemplate: '{testDir}/baselines/{testFilePath}/{arg}{ext}',
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
      testMatch: '**/responsive.spec.ts',
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro 11'],
      },
      testMatch: '**/responsive.spec.ts',
    },
  ],

  /* Global env available in tests */
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  webServer: process.env.CI
    ? [
        {
          command: 'pnpm --filter web-public dev --port 5173',
          url: BASE_URL,
          reuseExistingServer: false,
          timeout: 60_000,
        },
      ]
    : undefined, // In local dev, assume server is already running
});
