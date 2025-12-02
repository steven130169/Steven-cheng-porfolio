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

});