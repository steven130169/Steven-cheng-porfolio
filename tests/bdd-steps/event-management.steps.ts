import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { pageFixture } from './hooks.ts';

let page = pageFixture.page; // Initialize page within each step file for clarity

Given('I am on the {string} section', async (sectionName: string) => {
  await pageFixture.page.locator(`section#${sectionName.toLowerCase().replace(/ & /g, '-')}`).scrollIntoViewIfNeeded();
});

When('I click the {string} button', async (buttonName: string) => {
  await pageFixture.page.getByRole('button', { name: buttonName }).click();
});

When('I fill in the event form with:', async (dataTable: { rawTable: string[][] }) => {
  for (const row of dataTable.rawTable.slice(1)) { // Skip header row
    const [field, value] = row;
    await pageFixture.page.getByLabel(field).fill(value);
  }
});

When('I submit the form', async () => {
  await pageFixture.page.getByRole('button', { name: 'Save Event' }).click();
});

Then('I should see {string} added to the event list', async (eventName: string) => {
  await expect(pageFixture.page.getByText(eventName)).toBeVisible();
});

Then('I should see the role {string} displayed for the new event', async (role: string) => {
  await expect(pageFixture.page.getByText(role)).toBeVisible();
});

Then('the event form should be closed', async () => {
  await expect(pageFixture.page.getByRole('heading', { name: 'Add New Event' })).not.toBeVisible();
});

Then('I should not see {string} in the event list', async (eventName: string) => {
  await expect(pageFixture.page.getByText(eventName)).not.toBeVisible();
});

Given('there are more than {int} events available', async (count: number) => {
  // Initial state is 3 events. We need to add more to verify the "View All" button.
  // We will add 2 events to make it 5.
  for (let i = 4; i <= 5; i++) {
    await pageFixture.page.getByRole('button', { name: 'Add Event' }).click();
    await pageFixture.page.getByLabel('Title').fill(`Event ${i}`);
    await pageFixture.page.getByLabel('Role').fill('Test Role');
    await pageFixture.page.getByLabel('Date').fill('Future');
    await pageFixture.page.getByLabel('Description').fill('Test Description');
    await pageFixture.page.getByRole('button', { name: 'Save Event' }).click();
  }
});

When('I view the {string} section', async (sectionName: string) => {
  await pageFixture.page.getByRole('link', { name: sectionName }).first().click();
});

Then('I should see exactly {int} events displayed', async (count: number) => {
  await expect(pageFixture.page.locator('[data-testid="event-item"]')).toHaveCount(count);
});

Then('I should see a {string} button', async (buttonName: string) => {
  await expect(pageFixture.page.getByRole('button', { name: buttonName })).toBeVisible();
});

Then('I should see a list of existing events', async () => {
  // Check if the grid container exists
  await expect(pageFixture.page.locator('#event .grid')).toBeVisible();
  // Check if there are any event items
  await expect(pageFixture.page.locator('[data-testid="event-item"]')).not.toHaveCount(0);
});

Then('I should see event details like {string}', async (text: string) => {
  await expect(pageFixture.page.getByText(text)).toBeVisible();
});

Then('I should not see the 4th event or subsequent events directly in the list', async () => {
  // Assuming we know the 4th event's title from the initial data
  // In Event.tsx, the 4th event is "Kubernetes Advanced Networking"
  await expect(pageFixture.page.getByText('Kubernetes Advanced Networking')).not.toBeVisible();
});