import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('home tells the story and links to the map', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('One tile');
    await expect(page.getByRole('complementary', { name: 'Today on the island' })).toBeVisible();
    await page.getByRole('link', { name: /Explore the map/ }).click();
    await expect(page).toHaveURL(/\/map$/);
    await expect(page.getByRole('slider', { name: 'Day' })).toBeVisible();
  });

  test('logbook lists day 0 and opens its page', async ({ page }) => {
    await page.goto('/logbook');
    await page.getByRole('link', { name: /A sandbank in the open sea/ }).first().click();
    await expect(page).toHaveURL(/\/day\/0$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('A sandbank in the open sea');
  });

  test('chapters render MDX', async ({ page }) => {
    await page.goto('/chapters/the-routine');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('A day in the life of the routine');
    await expect(page.getByRole('heading', { level: 2, name: /Is today already done/ })).toBeVisible();
  });

  test('theme toggle switches to night', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /Switch to (night|day)/ });
    const before = await page.locator('html').getAttribute('data-theme');
    await toggle.click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before ?? '');
  });

  test('legal pages exist', async ({ page }) => {
    await page.goto('/impressum');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Impressum');
    await page.goto('/datenschutz');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Datenschutzerklärung');
  });
});
