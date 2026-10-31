import { defineConfig } from '@playwright/test';
import regression from './playwright.config';

/** Read-only diagnostic collection, separate from regression sign-off. */
export default defineConfig({
  ...regression,
  testMatch: '**/screen-data-audit.spec.ts',
  testIgnore: [],
});
