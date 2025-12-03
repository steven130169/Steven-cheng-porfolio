import { test, expect } from '@playwright/test';

test.describe('Portfolio E2E Smoke Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct metadata', async ({ page }) => {
    await expect(page).toHaveTitle('Steven Cheng (鄭棋文) | Senior Cloud Architect');
  });

  test('should render all major sections', async ({ page }) => {
    // Verify Navbar
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByText('Steven.Tech.Lab')).toBeVisible();

    // Verify Hero Section
    const heroSection = page.locator('main#home');
    await expect(heroSection).toBeVisible();
    await expect(page.getByText('Architecting High Availability Cloud Systems.')).toBeVisible();

    // Verify About Section (By text content as it might not have an ID on the section tag itself in some implementations, but assuming standard structure)
    // Checking for "About Me" heading or similar text from About.tsx
    // About.tsx content: <h2 ...>About Me</h2>
    await expect(page.getByRole('heading', { name: 'About Me' })).toBeVisible();

    // Verify Blog Section
    await expect(page.locator('#blog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tech Insights' })).toBeVisible();

    // Verify Event Section
    await expect(page.locator('#event')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Events & Community' })).toBeVisible();

    // Verify Speak Section
    await expect(page.locator('#speak')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Speaking' })).toBeVisible();

    // Verify Footer
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.getByText('Steven Cheng (鄭棋文)')).toBeVisible();
    await expect(page.getByText('Taiwan Taipei')).toBeVisible();
  });

  test('should navigate to sections when navbar links are clicked', async ({ page }) => {
    // Click Blog link
    await page.getByRole('link', { name: 'Blog' }).first().click();
    // Verify URL contains hash
    await expect(page).toHaveURL(/.*#blog/);
    
    // Click Contact link
    await page.getByRole('link', { name: 'Contact' }).first().click();
    await expect(page).toHaveURL(/.*#contact/);
  });

  test('should allow adding a new event via the form', async ({ page }) => {
    // 1. Navigate to Event section
    await page.getByRole('link', { name: 'Event' }).first().click();
    
    // 2. Click "Add Event"
    await page.getByRole('button', { name: 'Add Event' }).click();

    // 3. Fill form
    await page.getByLabel('Title').fill('Playwright E2E Workshop');
    await page.getByLabel('Role').fill('Lead Instructor');
    await page.getByLabel('Date').fill('Jan 2026');
    await page.getByLabel('Description').fill('Learning E2E testing best practices.');

    // 4. Submit
    await page.getByRole('button', { name: 'Save Event' }).click();

    // 5. Verify
    await expect(page.getByText('Playwright E2E Workshop')).toBeVisible();
    await expect(page.getByText('Lead Instructor')).toBeVisible();
    await expect(page.getByText('Jan 2026')).toBeVisible();
  });

  test('should display a maximum of 3 events and a "View All Events" button', async ({ page }) => {
    // Navigate to Event section
    await page.getByRole('link', { name: 'Event' }).first().click();

    // Verify only 3 event cards are visible (initialEvents has 5)
    const eventCards = page.locator('[data-testid="event-item"]');
    await expect(eventCards).toHaveCount(3); // Expecting 3 directly displayed

    // Verify "View All Events" button is visible
    await expect(page.getByRole('button', { name: 'View All Events' })).toBeVisible();

    // Verify the 4th event (Kubernetes Advanced Networking) is NOT visible
    await expect(page.getByText('Kubernetes Advanced Networking')).not.toBeVisible();
  });

});