import { defineConfig, devices } from '@playwright/test';

const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  reporter: ci ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
  },
  // Locally, use the installed Microsoft Edge (no browser download). CI installs all three engines.
  projects: ci
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ]
    : [{ name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } }],
  webServer: {
    command: 'node e2e/serve.mjs 4173',
    url: 'http://127.0.0.1:4173/e2e/fixture.html',
    reuseExistingServer: !ci,
  },
});
