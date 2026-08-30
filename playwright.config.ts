// Configuración de Playwright para pruebas end-to-end (Fase 10)
// Implementa BJ2-054
import { defineConfig, devices } from '@playwright/test';

const URL_BASE = process.env.PLAYWRIGHT_URL_BASE ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: URL_BASE,
    trace: 'on-first-retry',
    locale: 'es-MX',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : {
        command: 'npm run build && npm run start',
        url: URL_BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
