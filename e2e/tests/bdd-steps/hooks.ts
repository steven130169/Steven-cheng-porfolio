import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import * as playwright from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import net from 'net';

setDefaultTimeout(120 * 1000);

let browser: playwright.Browser;
let context: playwright.BrowserContext;
let frontendProcess: ChildProcess | undefined; // Only frontend process now

export const pageFixture = {
  page: undefined as unknown as playwright.Page,
  createdEvent: undefined as any,
};

export const BASE_URL = 'http://localhost:3000';
export const API_URL = 'http://localhost:3000/api/'; // API is now part of frontend monolith

async function waitForUrl(url: string, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.status < 599) return;
    } catch (e: any) {
      // ignore
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function ensurePortFree(port: number, host = '127.0.0.1') {
  // If we can bind to the port, it's free.
  // If not, something is listening; fail fast with a clear error.
  await new Promise<void>((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (err: any) => {
      if (err?.code === 'EADDRINUSE') {
        reject(
          new Error(
            `Port ${port} is already in use. Please stop the process using it and re-run the tests.`
          )
        );
      } else {
        reject(err);
      }
    });

    server.once('listening', () => {
      server.close(() => resolve());
    });

    server.listen(port, host);
  });
}

BeforeAll(async function () {
  // Set test API key for admin endpoints (used by middleware)
  if (!process.env.ADMIN_API_KEY) {
    process.env.ADMIN_API_KEY = 'test-admin-key';
  }

  console.log('🧹 Checking port 3000...');
  await ensurePortFree(3000);

  console.log('🚀 Starting Next.js Monolith for BDD tests...');

  const projectRoot = path.resolve(process.cwd(), '..');

  // Only start Frontend (Monolith)
  frontendProcess = spawn('npm', ['run', 'start:frontend'], {
    cwd: projectRoot,
    stdio: 'ignore',
    shell: true,
    detached: true,
    env: { ...process.env, PORT: '3000', ADMIN_API_KEY: process.env.ADMIN_API_KEY },
  });

  console.log('⏳ Waiting for Next.js Monolith to become available...');

  try {
    await waitForUrl('http://localhost:3000'); // Only wait for frontend
    console.log('✅ Next.js Monolith is up and running!');
  } catch (err) {
    console.error('❌ Timeout waiting for Next.js Monolith to start.');
    if (frontendProcess && frontendProcess.pid) {
      try {
        process.kill(-frontendProcess.pid);
      } catch (e) {}
    }
    throw err;
  }

  console.log('🎭 Starting Playwright browser...');
  browser = await playwright.chromium.launch({ headless: true });
});

Before(async function () {
  // No separate backend to reset now. Reset logic needs to be moved to Next.js API route / server action if needed.
  // For now, E2E/BDD will operate without a clean backend state for each scenario.
  // This will be re-addressed when implementing Next.js API routes/Server Actions for data.

  context = await browser.newContext({
    baseURL: BASE_URL,
  });
  pageFixture.page = await context.newPage();
});

After(async function () {
  await pageFixture.page?.close();
  await context.close();
});

AfterAll(async function () {
  await browser.close();

  console.log('🛑 Stopping Next.js Monolith...');
  if (frontendProcess && frontendProcess.pid) {
    try {
      process.kill(-frontendProcess.pid);
    } catch (e) {}
  }
});
