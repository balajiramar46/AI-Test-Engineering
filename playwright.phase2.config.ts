import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'line',
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'node tests/support/static-test-server.cjs',
    url: 'http://127.0.0.1:8081/button.html',
    reuseExistingServer: true
  }
});
