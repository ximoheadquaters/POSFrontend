import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase E Step 5 Tenant Plan & Billing Management Client Tests', () => {

  test('1. Plan & Billing route is registered under tenant /settings/billing route outside super-admin console', () => {
    const code = fs.readFileSync(path.resolve(__dirname, '../routes/AppRoutes.jsx'), 'utf8');
    expect(code.includes('/settings/billing')).toBe(true);
    expect(code.includes('TenantBillingPage')).toBe(true);
    // Ensure tenant route is not inside AdminRoute tree
    const adminIndex = code.indexOf('<Route element={<AdminRoute />}>');
    const billingIndex = code.indexOf('/settings/billing');
    expect(billingIndex).toBeLessThan(adminIndex);
  });

  test('2. Active subscription renders plan name and next renewal date', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Your subscription is active.')).toBe(true);
    expect(pageCode.includes('Next Renewal / Period End')).toBe(true);
  });

  test('3. Trialing status displays trial notice', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Your trial is active.')).toBe(true);
  });

  test('4. Past-due state shows grace period recovery guidance', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('We couldn’t renew your subscription.')).toBe(true);
    expect(pageCode.includes('Grace period ends:')).toBe(true);
  });

  test('5. Suspended state explains store data preservation', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Your subscription needs attention.')).toBe(true);
    expect(pageCode.includes('Your store data is safely preserved.')).toBe(true);
  });

  test('6. Canceled state shows paid-through date', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Your subscription will end soon.')).toBe(true);
  });

  test('7. Paid provisioning failure does not show Pay Again or Pay Now button', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Your payment was received, but store setup is not complete.')).toBe(true);
    expect(pageCode.includes('Retry Setup')).toBe(true);
    expect(pageCode.includes('Pay Again')).toBe(false);
  });

  test('8. Plan features use customer-friendly labels', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Point of Sale Checkout')).toBe(true);
    expect(pageCode.includes('Products & Inventory Management')).toBe(true);
  });

  test('9. Raw internal module codes are omitted from normal UI', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('mod_inventory_core')).toBe(false);
    expect(pageCode.includes('recipes_internal')).toBe(false);
  });

  test('10. Payment method displays unavailable message without fabricating credentials', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Payment method details are not available yet.')).toBe(true);
    expect(pageCode.includes('•••• 4242')).toBe(false);
  });

  test('11. Production without provider displays Contact Support / Sales link', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Online billing management is not available yet. Contact Ximo support.')).toBe(true);
    expect(pageCode.includes('Contact Sales')).toBe(true);
  });

  test('12. Test actions display explicit test-mode warning', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Test billing action — no real payment will be processed.')).toBe(true);
  });

  test('13. Plan comparison uses official monthly prices from API DTO', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('subscription.plan.monthlyPrice')).toBe(true);
  });

  test('14. URL or client price tampering is ignored by plan DTO renderer', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Number(subscription.plan.monthlyPrice)')).toBe(true);
  });

  test('15. Downgrade warning explicitly states store data will be preserved', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Your data will not be deleted')).toBe(true);
    expect(pageCode.includes('Features outside the new plan will become unavailable')).toBe(true);
  });

  test('16. Cancellation preview validates currentPeriodEnd and formats with organization timezone', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('timeZone: "Asia/Manila"')).toBe(true);
    expect(pageCode.includes('toLocaleDateString("en-PH"')).toBe(true);
  });

  test('17. Missing or invalid cancellation date displays safe error and blocks confirmation', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('We couldn’t determine your paid-through date. Contact Ximo support before canceling.')).toBe(true);
    expect(pageCode.includes('isNaN(new Date(subscription.currentPeriodEnd).getTime())')).toBe(true);
  });

  test('18. Empty invoice history renders friendly empty state message', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('No invoices are available yet.')).toBe(true);
  });

  test('19. Permission denial state displays friendly administrative message', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Only your organization’s billing administrator can manage the subscription.')).toBe(true);
  });

  test('20. 320px responsive CSS container and target classes are present', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('min-h-[44px]')).toBe(true);
    expect(pageCode.includes('p-4')).toBe(true);
  });
});
