import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import * as playwright from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';

setDefaultTimeout(60 * 1000);

let browser: playwright.Browser;
let context: playwright.BrowserContext;
let backendProcess: ChildProcess | undefined;
let frontendProcess: ChildProcess | undefined;

export const pageFixture = {
  page: undefined as unknown as playwright.Page,
};

export const BASE_URL = 'http://localhost:3000';
export const API_URL = 'http://localhost:3001/api/';

BeforeAll(async function () {
  console.log('Starting servers for BDD tests...');
  
  // We attempt to start servers. If they are already running (e.g. user ran npm run dev), 
  // these might fail or multiple instances might try to run. 
  // ideally we should check ports. For now, we assume sequential execution in CI/Test script.
  
  backendProcess = spawn('npm', ['run', 'start:backend'], { stdio: 'ignore', shell: true, detached: true });
  frontendProcess = spawn('npm', ['run', 'start:frontend'], { stdio: 'ignore', shell: true, detached: true });

  console.log('Waiting for servers to stabilize...');
  await new Promise(r => setTimeout(r, 15000)); // Give enough time for NestJS to build

  console.log('Starting Playwright browser...');
  browser = await playwright.chromium.launch({ headless: true });
});

Before(async function () {
  try {
    const apiContext = await playwright.request.newContext({ baseURL: API_URL });
    const res = await apiContext.delete('events/test/reset');
    if (!res.ok()) {
        console.error(`Backend reset failed: ${res.status()} ${res.statusText()}`);
    }
  } catch (e) {
    console.warn('Failed to reset backend. Is it running?', e);
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
  
  if (backendProcess && backendProcess.pid) {
    try { process.kill(-backendProcess.pid); } catch(e) {}
  }
  if (frontendProcess && frontendProcess.pid) {
    try { process.kill(-frontendProcess.pid); } catch(e) {}
  }
});