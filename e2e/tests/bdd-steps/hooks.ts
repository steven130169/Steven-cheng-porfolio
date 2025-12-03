import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import * as playwright from '@playwright/test'; // Import as namespace
import { spawn, ChildProcess } from 'child_process';

setDefaultTimeout(60 * 1000);

let browser: playwright.Browser; // Use playwright.Browser
let context: playwright.BrowserContext;
let page: playwright.Page;
let serverProcess: ChildProcess;
let backendProcess: ChildProcess;

export const pageFixture = {
  page: undefined as unknown as playwright.Page, // Use playwright.Page
};

export const BASE_URL = 'http://localhost:3000';
export const API_URL = 'http://localhost:3001/api/';

BeforeAll(async function () {
  console.log('Starting development servers...');
  serverProcess = spawn('npm', ['run', 'dev', '-w', 'frontend'], {
    stdio: 'ignore',
    detached: true,
    shell: false
  });

  backendProcess = spawn('npm', ['run', 'start:dev', '-w', 'backend'], {
    stdio: 'ignore',
    detached: true,
    shell: false
  });

  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for both to start

  browser = await playwright.chromium.launch({ headless: true }); // Use playwright.chromium
});

Before(async function () {
  context = await browser.newContext({
    baseURL: BASE_URL,
  });
  page = await context.newPage();
  pageFixture.page = page;
});

After(async function () {
  await page.close();
  await context.close();
});

AfterAll(async function () {
  await browser.close();
  
  if (serverProcess && serverProcess.pid) {
    console.log('Stopping frontend server...');
    try {
      process.kill(-serverProcess.pid);
    } catch (e) {}
  }

  if (backendProcess && backendProcess.pid) {
    console.log('Stopping backend server...');
    try {
      process.kill(-backendProcess.pid);
    } catch (e) {}
  }
});