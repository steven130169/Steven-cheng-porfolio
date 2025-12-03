import { Given, When, Then } from '@cucumber/cucumber';
import * as playwright from '@playwright/test'; // Import as namespace
import { pageFixture } from './hooks.ts'; // Assuming a hooks.ts for page object

let page: playwright.Page;

const sectionSelectorMap: { [key: string]: string } = {
  'Navbar': 'nav',
  'Hero': 'main#home', // Or specific hero section selector
  'About': '#about', // Assuming About section has id="about"
  'Blog': '#blog',
  'Events & Community': '#event',
  'Speaking': '#speak',
  'Footer': 'footer',
  'Contact': '#contact' // Footer acts as contact section based on ID
};

const getSelector = (sectionName: string) => {
  return sectionSelectorMap[sectionName] || `section#${sectionName.toLowerCase().replace(/ & /g, '-')}`;
};

Given('I open the portfolio homepage', async () => {
  page = pageFixture.page;
  await page.goto('/');
});

Given('the portfolio website is loaded', async () => {
  page = pageFixture.page;
  await page.goto('/');
});

Given('I am on the homepage', async () => {
  page = pageFixture.page;
  await page.goto('/');
});

When('I scroll to the {string} section', async (sectionName: string) => {
  page = pageFixture.page;
  const selector = getSelector(sectionName);
  await page.locator(selector).scrollIntoViewIfNeeded();
});

// A generic "Then I should see {string}" step
Then('I should see {string}', async (text: string) => {
  page = pageFixture.page;
  await playwright.expect(page.getByText(text)).toBeVisible();
});

Then('I should see the {string} section', async (sectionName: string) => {
  page = pageFixture.page;
  const selector = getSelector(sectionName);
  await playwright.expect(page.locator(selector)).toBeVisible();
});
