import { test, expect } from '@playwright/test';

test('customer configures an order and must accept terms before payment', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/public/plans', (route) =>
    route.fulfill({
      json: [
        {
          code: 'starter',
          displayName: 'Starter',
          monthlyPrice: 499,
          availability: 'available',
          features: ['POS checkout'],
          modules: [{ code: 'pos', name: 'POS checkout' }],
        },
      ],
    }),
  );
  await page.route('**/public/checkout/config', (route) =>
    route.fulfill({
      json: {
        enabled: true,
        testMode: true,
        orderConfiguration: {
          software: [{ code: 'ximo_pos', name: 'Ximo POS' }],
          termsVersion: '2026-09-24',
          termsUrl:
            'https://docs.google.com/document/d/1EUBl9DCTGvgbL8CM3AhOqS-194cjLWmxkTdMxmREg7s/edit?tab=t.0',
          includedBranches: 1,
          extraBranchMonthlyPrice: 199,
          maxBranches: 50,
          addOns: [
            {
              code: 'promotions',
              name: 'Promotions & combos',
              monthlyPrice: 149,
              moduleCodes: ['promotions'],
            },
          ],
        },
      },
    }),
  );
  await page.route('**/public/checkout/quote', async (route) => {
    const body = route.request().postDataJSON();
    expect(body.branchCount).toBe(3);
    expect(body.addOnCodes).toEqual(['promotions']);
    expect(body.modificationRequest).toBe('Custom delivery workflow');
    await route.fulfill({
      json: {
        amount: 104600,
        lineItems: [
          { code: 'starter', name: 'Starter', unitAmount: 49900, quantity: 1 },
          { code: 'promotions', name: 'Promotions & combos', unitAmount: 14900, quantity: 1 },
          { code: 'extra_branches', name: 'Additional branches', unitAmount: 19900, quantity: 2 },
        ],
      },
    });
  });
  await page.goto('/checkout');
  await page.getByLabel('Business name').fill('Test store');
  await page.getByLabel('Retail', { exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Package', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('checkbox', { name: /Promotions/ }).check();
  await page.getByLabel('Specific modifications (optional)').fill('Custom delivery workflow');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Number of branches').fill('3');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review & terms' })).toBeVisible();
  await expect(page.getByText('₱1,046.00', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm order & continue' })).toBeDisabled();
  await page.getByRole('checkbox', { name: /I have reviewed/ }).check();
  await page.getByRole('button', { name: 'Confirm order & continue' }).click();
  await expect(page.getByRole('heading', { name: 'Payment', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Pay .* with QR Ph/ })).toBeDisabled();
  await page.reload();
  await expect(page.getByLabel('Number of branches')).toHaveValue('3');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: /I have reviewed/ })).not.toBeChecked();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({ path: 'test-results/subscription-review-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 1440);
  await page.screenshot({ path: 'test-results/subscription-review-desktop.png', fullPage: true });
});
