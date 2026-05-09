import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: false, // Ensure tests run sequentially as requested
  retries: 0,
  workers: 1, // Forces sequential execution
  use: {
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
});
