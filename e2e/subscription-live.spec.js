import { test, expect } from '@playwright/test';

// Read-only rollout verification: creates no accounts, orders or payments.
test('live checkout loads real packages, prices branches and requires agreement', async ({ page }) => {
  test.skip(!process.env.XIMO_WEB_URL, 'Set XIMO_WEB_URL to the deployed website.');
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/checkout');
  await page.getByLabel('Business name').fill('Checkout deployment verification');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Package', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add-ons', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Number of branches').fill('2');
  const quoted = page.waitForResponse(response => response.url().includes('/public/checkout/quote') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const response = await quoted;
  expect(response.status()).toBe(200);
  const quote = await response.json();
  expect(quote.configuration.branchCount).toBe(2);
  expect(quote.lineItems.find(line => line.code === 'extra_branches').unitAmount).toBe(50000);
  expect(quote.amount).toBe(quote.lineItems.reduce((sum, line) => sum + line.quantity * line.unitAmount, 0));
  await expect(page.getByRole('button', { name: 'Confirm order & continue' })).toBeDisabled();
  await expect(page.getByRole('link', { name: /Read the Terms/ })).toHaveAttribute('href', /1EUBl9DCTGvgbL8CM3AhOqS/);
  await page.getByRole('checkbox', { name: /I have reviewed/ }).check();
  await page.screenshot({ path: 'test-results/live-subscription-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Confirm order & continue' }).click();
  await expect(page.getByRole('heading', { name: 'Payment', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Pay .* with QR Ph/ })).toBeDisabled();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/live-subscription-desktop.png', fullPage: true });
});
