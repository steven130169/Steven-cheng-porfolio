import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';

setDefaultTimeout(60 * 1000);

let browser: Browser;
let context: BrowserContext;
let page: Page;
let serverProcess: ChildProcess;

export const pageFixture = {
  page: undefined as unknown as Page,
};

export const BASE_URL = 'http://localhost:3000';

BeforeAll(async function () {
  console.log('Starting development server...');
  serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'ignore',
    detached: true,
    shell: true
  });

  // Give the server some time to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  browser = await chromium.launch({ headless: true });
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
    console.log('Stopping development server...');
    try {
      // Kill the process group
      process.kill(-serverProcess.pid);
    } catch (e) {
      // Ignore error if process is already dead
    }
  }
});