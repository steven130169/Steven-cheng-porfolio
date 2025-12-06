import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import * as playwright from '@playwright/test';
import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';

setDefaultTimeout(120 * 1000);

let browser: playwright.Browser;
let context: playwright.BrowserContext;
let backendProcess: ChildProcess | undefined;
let frontendProcess: ChildProcess | undefined;

export const pageFixture = {
  page: undefined as unknown as playwright.Page,
};

export const BASE_URL = 'http://localhost:3000';
export const API_URL = 'http://localhost:3001/api/';

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
  console.log('🧹 Cleaning up ports 3000 and 3001...');
  try { execSync('npx kill-port 3000 3001'); } catch (e) {}

  console.log('🚀 Starting servers for BDD tests...');
  
  // We need to run these commands from the ROOT directory because 'start:backend' and 'start:frontend' 
  // are defined in the root package.json.
  // process.cwd() when running 'npm run test:bdd -w e2e' is the 'e2e' folder.
  const projectRoot = path.resolve(process.cwd(), '..');

  backendProcess = spawn('npm', ['run', 'start:backend'], { 
    cwd: projectRoot,
    stdio: 'ignore', 
    shell: true, 
    detached: true,
    env: { ...process.env, PORT: '3001' }
  });

  frontendProcess = spawn('npm', ['run', 'start:frontend'], { 
    cwd: projectRoot,
    stdio: 'ignore', 
    shell: true, 
    detached: true,
    env: { ...process.env, PORT: '3000' } 
  });

  console.log('⏳ Waiting for servers to become available...');
  
  try {
    await Promise.all([
      waitForUrl('http://localhost:3001/api'),
      waitForUrl('http://localhost:3000'),
    ]);
    console.log('✅ Servers are up and running!');
  } catch (err) {
    console.error('❌ Timeout waiting for servers to start.');
    if (backendProcess && backendProcess.pid) {
        try { process.kill(-backendProcess.pid); } catch(e) {}
    }
    if (frontendProcess && frontendProcess.pid) {
        try { process.kill(-frontendProcess.pid); } catch(e) {}
    }
    throw err;
  }

  console.log('🎭 Starting Playwright browser...');
  browser = await playwright.chromium.launch({ headless: true });
});

Before(async function () {
  try {
    const apiContext = await playwright.request.newContext({ baseURL: API_URL });
    await apiContext.delete('events/test/reset').catch(() => {}); 
  } catch (e) {
    console.warn('Warning: Failed to reset backend state.', e);
  }

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
  
  console.log('🛑 Stopping servers...');
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
  
  try { execSync('npx kill-port 3000 3001'); } catch (e) {}
});
