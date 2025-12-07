import { test, expect } from '@playwright/test';

test.describe('Portfolio E2E Smoke Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Backend service has been removed in favor of Next.js Monolith.
    // Backend API tests will be re-introduced once the new Next.js API Routes and Server Actions are implemented.
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

  // Event related tests are removed as they relied on the separate backend API.
  // These will be re-implemented once the Next.js API Routes/Server Actions for events are ready.
  // test('should allow adding a new event via the form', async ({ page }) => { ... });
  // test('should display a maximum of 3 events and a "View All Events" button', async ({ page, request }) => { ... });
});