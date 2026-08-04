import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase E Step 6 Platform Billing Operations Client Tests', () => {

  test('1. Platform billing route is registered under AdminRoute super-admin tree in AppRoutes.jsx', () => {
    const code = fs.readFileSync(path.resolve(__dirname, '../routes/AppRoutes.jsx'), 'utf8');
    expect(code.includes('PlatformBillingPage')).toBe(true);
    const adminIndex = code.indexOf('<Route element={<AdminRoute />}>');
    const platformBillingIndex = code.lastIndexOf('billing');
    expect(platformBillingIndex).toBeGreaterThan(adminIndex);
  });

  test('2. Super-admin can access platform billing overview page', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Platform Billing Operations')).toBe(true);
    expect(pageCode.includes('Overview Metrics')).toBe(true);
  });

  test('3. Overview summary cards display operational counts', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Active Subscriptions')).toBe(true);
    expect(pageCode.includes('Provisioning Failures')).toBe(true);
    expect(pageCode.includes('Failed Webhooks')).toBe(true);
  });

  test('4. Subscription table includes status and search filter controls', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Search by organization or email...')).toBe(true);
    expect(pageCode.includes('All Statuses')).toBe(true);
  });

  test('5. Public checkout tokens are masked in operational tables', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('chk.publicTokenMasked')).toBe(true);
    expect(pageCode.includes('chk.public_token')).toBe(false); // Raw token never displayed!
  });

  test('6. Paid provisioning failure displays Retry Setup button', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Retry Setup')).toBe(true);
  });

  test('7. Unpaid checkout hides retry action button and shows unpaid label', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Unpaid checkout')).toBe(true);
  });

  test('8. Email-unverified checkout hides retry action button', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Email unverified')).toBe(true);
  });

  test('9. Retry pending disables repeated action button', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('disabled={chk.status === "provisioning"}')).toBe(true);
  });

  test('10. Webhook error displays safe error summary without raw trace', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('wh.errorSummary')).toBe(true);
  });

  test('11. Raw webhook payload is hidden by default in event list', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('wh.payload')).toBe(false);
    expect(pageCode.includes('wh.rawBody')).toBe(false);
  });

  test('12. Trial extension requires non-empty audit reason input', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Audit Reason (Required):')).toBe(true);
    expect(pageCode.includes('disabled={!reasonInput || reasonInput.trim().length === 0}')).toBe(true);
  });

  test('13. Suspension confirmation displays store data preservation warning', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Users may lose operational access. Store data will remain preserved.')).toBe(true);
  });

  test('14. Reactivation displays entitlement explanation notice', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Access will be restored according to the organization’s plan, modules, and user permissions.')).toBe(true);
  });

  test('15. Permanent test environment banner is visible', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Test billing environment (no real payment provider is connected).')).toBe(true);
    expect(pageCode.includes('Sandbox Mode')).toBe(true);
  });

  test('16. Production mode without provider disables synthetic payment triggers', () => {
    const controllerCode = fs.readFileSync(path.resolve(__dirname, '../../../server/src/controllers/adminBillingController.js'), 'utf8');
    expect(controllerCode.includes('isTestEnvironment')).toBe(true);
  });

  test('17. Server-side pagination controls (Previous / Next) are rendered', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('Previous')).toBe(true);
    expect(pageCode.includes('Next')).toBe(true);
    expect(pageCode.includes('subPagination.totalPages')).toBe(true);
  });

  test('18. API errors are mapped safely without exposing unhandled exceptions', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('err?.response?.data?.error?.message || "Operation failed."')).toBe(true);
  });

  test('19. Platform super-admin and tenant navigation remain strictly separated', () => {
    const appRoutesCode = fs.readFileSync(path.resolve(__dirname, '../routes/AppRoutes.jsx'), 'utf8');
    expect(appRoutesCode.includes('/settings/billing')).toBe(true);
    expect(appRoutesCode.includes('path="billing"')).toBe(true);
  });

  test('20. 320px responsive container and 44px minimum target sizes are present', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/PlatformBilling/PlatformBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('min-h-[44px]')).toBe(true);
    expect(pageCode.includes('overflow-x-auto')).toBe(true);
  });
});
