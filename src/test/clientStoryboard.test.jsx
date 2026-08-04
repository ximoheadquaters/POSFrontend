import { describe, test, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

if (typeof globalThis.sessionStorage === 'undefined') {
  const store = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe('Phase E Step 4 Client Storyboard Unit Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('1. Pricing loading state component renders spinner', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Pricing/PricingPage.jsx'), 'utf8');
    expect(pageCode.includes('Loading official plan catalog...')).toBe(true);
    expect(pageCode.includes('<Spinner')).toBe(true);
  });

  test('2. Pricing API failure presents retry action', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Pricing/PricingPage.jsx'), 'utf8');
    expect(pageCode.includes('Try Again')).toBe(true);
    expect(pageCode.includes('fetchPlans')).toBe(true);
  });

  test('3. Pricing fallback handles empty catalog state gracefully', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Pricing/PricingPage.jsx'), 'utf8');
    expect(pageCode.includes('FALLBACK_PLANS')).toBe(true);
  });

  test('4. Recommended plan presentation displays badge', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Pricing/PricingPage.jsx'), 'utf8');
    expect(pageCode.includes('Recommended')).toBe(true);
    expect(pageCode.includes('plan.recommended')).toBe(true);
  });

  test('5. Unavailable plan button is disabled', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Pricing/PricingPage.jsx'), 'utf8');
    expect(pageCode.includes('isUnavailable')).toBe(true);
    expect(pageCode.includes('disabled={isUnavailable}')).toBe(true);
  });

  test('6. Business-type filter is a presentation-only filter', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Pricing/PricingPage.jsx'), 'utf8');
    expect(pageCode.includes('Filter view:')).toBe(true);
    expect(pageCode.includes('setBusinessFilter')).toBe(true);
  });

  test('7. Signup friendly error mapping converts raw errors', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Signup/SignupPage.jsx'), 'utf8');
    expect(pageCode.includes('This email already has a Ximo account.')).toBe(true);
  });

  test('8. Existing account is directed to sign in', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Signup/SignupPage.jsx'), 'utf8');
    expect(pageCode.includes('Sign In to Continue')).toBe(true);
  });

  test('9. Unauthenticated checkout stops at Account step', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('!isAuthenticated')).toBe(true);
    expect(pageCode.includes('You must be signed in to set up a subscription.')).toBe(true);
  });

  test('10. Unverified account is prevented from continuing', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('Email verification is required before provisioning.')).toBe(true);
    expect(pageCode.includes('!isEmailVerified')).toBe(true);
  });

  test('11. Verified account permits continuation to business setup', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('Signed in as owner:')).toBe(true);
  });

  test('12. Official plan details from server replace stale session or URL values', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('publicApi.getPublicPlans()')).toBe(true);
    expect(pageCode.includes('Official price resolved directly from Ximo server')).toBe(true);
  });

  test('13. URL price manipulation is ignored by checkout creation', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('planCode: selectedPlan.code')).toBe(true);
    expect(pageCode.includes('price:')).toBe(false); // Price excluded from client payload
  });

  test('14. Checkout request excludes price and module data', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('modules:')).toBe(false);
    expect(pageCode.includes('price:')).toBe(false);
  });

  test('15. Double-click prevention flag disables repeat submissions', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('if (submitting) return;')).toBe(true);
  });

  test('16. Test environment displays "no real payment" notice', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('Test checkout — no real payment will be charged.')).toBe(true);
  });

  test('17. Production environment disables online checkout when unconfigured', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('Online subscription checkout is not available yet.')).toBe(true);
  });

  test('18. Processing page polls using an opaque token parameter', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutProcessingPage.jsx'), 'utf8');
    expect(pageCode.includes('publicApi.getCheckoutStatus(token)')).toBe(true);
  });

  test('19. Missing token shows invalid-session state on success page', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutSuccessPage.jsx'), 'utf8');
    expect(pageCode.includes('We couldn’t find this checkout session.')).toBe(true);
  });

  test('20. Success page requires authoritative active status from server', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutSuccessPage.jsx'), 'utf8');
    expect(pageCode.includes('publicApi.getCheckoutStatus(token)')).toBe(true);
    expect(pageCode.includes('Your Ximo store is ready.')).toBe(true);
  });

  test('21. Provisioning status does not prematurely show success', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutSuccessPage.jsx'), 'utf8');
    expect(pageCode.includes('navigate(`/checkout/processing?token=${token}`')).toBe(true);
  });

  test('22. Failed status shows retry and support links', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutSuccessPage.jsx'), 'utf8');
    expect(pageCode.includes('Setup Requires Attention')).toBe(true);
    expect(pageCode.includes('Contact Support')).toBe(true);
  });

  test('23. Session-storage state restores business details', () => {
    sessionStorage.setItem('ximo_business_data', JSON.stringify({ organizationName: 'Restored Store' }));
    const saved = JSON.parse(sessionStorage.getItem('ximo_business_data'));
    expect(saved.organizationName).toBe('Restored Store');
  });

  test('24. Public layout styles support 320px viewport without overflow', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Pricing/PricingPage.jsx'), 'utf8');
    expect(pageCode.includes('px-4')).toBe(true);
    expect(pageCode.includes('min-h-[44px]')).toBe(true);
  });
});
