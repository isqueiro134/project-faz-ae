import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config.js';

export default defineConfig(baseConfig, {
    timeout: 120_000,
    use: {
        ...baseConfig.use,
        launchOptions: {
            slowMo: 1_000,
        },
    },
});
