import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { pageFixture } from './hooks.ts';

let page = pageFixture.page; // Initialize page within each step file for clarity

Given('I am on the portfolio homepage', async () => {
  await pageFixture.page.goto('/');
});

Then('I should see {string} displayed as the location', async (location: string) => {
    await expect(pageFixture.page.getByText(location)).toBeVisible();
});

Then('I should see {string} in the copyright notice', async (copyrightText: string) => {
    // This is a more robust way to find the copyright, as it's within a specific element
    await expect(pageFixture.page.locator('footer').getByText(copyrightText)).toBeVisible();
});
