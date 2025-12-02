import { Given, When, Then } from '@cucumber/cucumber';
import * as playwright from '@playwright/test'; // Import as namespace
import { pageFixture } from './hooks.ts'; // Assuming hooks.ts will export pageFixture

let page = pageFixture.page; // Initialize page within each step file for clarity

const sectionSelectorMap: { [key: string]: string } = {
  'Navbar': 'nav',
  'Hero': 'main#home',
  'About': '#about',
  'Blog': '#blog',
  'Events & Community': '#event',
  'Speaking': '#speak',
  'Footer': 'footer',
};

Then('the page title should be {string}', async (expectedTitle: string) => {
  await playwright.expect(pageFixture.page).toHaveTitle(expectedTitle);
});

Then('I should see the {string} section with text {string}', async (sectionName: string, text: string) => {
  const selector = sectionSelectorMap[sectionName] || `section#${sectionName.toLowerCase()}`;
  await playwright.expect(pageFixture.page.locator(selector)).toBeVisible();
  await playwright.expect(pageFixture.page.getByText(text)).toBeVisible();
});

When('I click the {string} link in the navbar', async (linkName: string) => {
  await pageFixture.page.getByRole('link', { name: linkName, exact: true }).first().click();
});

Then('the URL should contain {string}', async (expectedHash: string) => {
  await playwright.expect(pageFixture.page).toHaveURL(new RegExp(`.*${expectedHash}`));
});

Then('I should not see {string}', async (text: string) => {
  await playwright.expect(pageFixture.page.getByText(text)).not.toBeVisible();
});