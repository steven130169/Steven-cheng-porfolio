import { test, expect } from '@playwright/test';

test.describe('Portfolio E2E Smoke Tests', () => {
  
  test.beforeEach(async ({ page, request }) => {
    // Reset backend data before each test
    await request.delete('http://localhost:3001/api/events/test/reset');
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

    // Verify About Section
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
    await page.getByRole('link', { name: 'Blog' }).first().click();
    await expect(page).toHaveURL(/.*#blog/);
    
    await page.getByRole('link', { name: 'Contact' }).first().click();
    await expect(page).toHaveURL(/.*#contact/);
  });

  test('should allow adding a new event via the form', async ({ page }) => {
    const uniqueId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    const title = `Playwright E2E Workshop ${uniqueId}`;
    
    await page.getByRole('link', { name: 'Event' }).first().click();
    
    // Wait for events to load
    await expect(page.getByText('Loading events...')).not.toBeVisible();

    await page.getByRole('button', { name: 'Add Event' }).click();

    await page.getByLabel('Title').fill(title);
    await page.getByLabel('Role').fill('Lead Instructor');
    await page.getByLabel('Date').fill('Jan 2026');
    await page.getByLabel('Description').fill('Learning E2E testing best practices.');

    await page.getByRole('button', { name: 'Save Event' }).click();

    // Scope check to the specific card to avoid "Lead Instructor" duplicates from other parallel runs
    const card = page.locator('[data-testid="event-item"]').filter({ hasText: title });
    await expect(card).toBeVisible();
    await expect(card.getByText('Lead Instructor')).toBeVisible();
    await expect(card.getByText('Jan 2026')).toBeVisible();
  });

  test('should display a maximum of 3 events and a "View All Events" button', async ({ page, request }) => {
    // Seed extra events via API (Assuming 2 initial events, we need > 3)
    for (let i = 0; i < 2; i++) {
        await request.post('http://localhost:3001/api/events', {
            data: {
                title: `Extra Smoke Event ${i}`,
                role: 'Test',
                date: 'Future',
                description: 'Desc',
                tags: ['Test'],
                status: 'Upcoming'
            }
        });
    }

    await page.reload();
    await page.getByRole('link', { name: 'Event' }).first().click();
    
    // Wait for loading
    await expect(page.getByText('Loading events...')).not.toBeVisible();

    const eventCards = page.locator('[data-testid="event-item"]');
    await expect(eventCards).toHaveCount(3); 

    await expect(page.getByRole('button', { name: 'View All Events' })).toBeVisible();
  });
});
