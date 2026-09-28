import { defineConfig, devices } from '@playwright/test';

/** Smoke flows for verify:full – run against a production build. */
export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3200',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'npx next start -p 3200', url: 'http://localhost:3200', reuseExistingServer: true, timeout: 60_000 },
});
