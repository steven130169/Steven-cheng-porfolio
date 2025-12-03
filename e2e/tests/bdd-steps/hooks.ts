import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import * as playwright from '@playwright/test'; // Import as namespace

setDefaultTimeout(60 * 1000);

let browser: playwright.Browser;
let context: playwright.BrowserContext;
export let pageFixture: { page: playwright.Page | undefined } = { page: undefined };

export const BASE_URL = 'http://localhost:3000';
export const API_URL = 'http://localhost:3001/api/';

BeforeAll(async function () {
  console.log('Starting Playwright browser...');
  browser = await playwright.chromium.launch({ headless: true });
});

Before(async function () {
  // Reset backend data before each test scenario
  const apiContext = await playwright.request.newContext({ baseURL: API_URL });
  await apiContext.delete('events/test/reset');

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
});
