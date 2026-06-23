import { mkdirSync, rmSync } from 'fs';
import path from 'path';
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
    e2eServer: [async ({}, use) => {
        const databasePath = path.resolve('tests', '.tmp', `e2e-${process.pid}.sqlite`);
        process.env.PORT = '3100';
        process.env.SQLITE_DB_PATH = databasePath;

        mkdirSync(path.dirname(databasePath), { recursive: true });
        for (const suffix of ['', '-shm', '-wal']) {
            rmSync(`${databasePath}${suffix}`, { force: true });
        }

        const [{ server }, { closeDB }] = await Promise.all([
            import('../app.js'),
            import('../backend/config/db.js'),
        ]);

        await use();

        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
        await closeDB();
    }, { scope: 'worker', auto: true }],
});

export { expect };
