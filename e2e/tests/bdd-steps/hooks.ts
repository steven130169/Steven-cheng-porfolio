import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import * as playwright from '@playwright/test';
import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';

setDefaultTimeout(120 * 1000);

let browser: playwright.Browser;
let context: playwright.BrowserContext;
let frontendProcess: ChildProcess | undefined; // Only frontend process now

export const pageFixture = {
  page: undefined as unknown as playwright.Page,
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

BeforeAll(async function () {
  console.log('🧹 Cleaning up port 3000...');
  try { execSync('npx kill-port 3000'); } catch (e) {} // Only cleanup frontend port

  console.log('🚀 Starting Next.js Monolith for BDD tests...');
  
  const projectRoot = path.resolve(process.cwd(), '..');

  // Only start Frontend (Monolith)
  frontendProcess = spawn('npm', ['run', 'start:frontend'], { 
    cwd: projectRoot,
    stdio: 'ignore', 
    shell: true, 
    detached: true,
    env: { ...process.env, PORT: '3000' } 
  });

  console.log('⏳ Waiting for Next.js Monolith to become available...');
  
  try {
    await waitForUrl('http://localhost:3000'); // Only wait for frontend
    console.log('✅ Next.js Monolith is up and running!');
  } catch (err) {
    console.error('❌ Timeout waiting for Next.js Monolith to start.');
    if (frontendProcess && frontendProcess.pid) {
        try { process.kill(-frontendProcess.pid); } catch(e) {}
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
    try { process.kill(-frontendProcess.pid); } catch(e) {}
  }
  
  try { execSync('npx kill-port 3000'); } catch (e) {} // Only kill frontend port
});