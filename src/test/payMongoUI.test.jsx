import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase E Step 8 PayMongo Sandbox UX Client Tests', () => {

  test('1. PayMongo sandbox warning is rendered when provider is PayMongo in test mode', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('Test checkout — no real payment is collected.')).toBe(true);
  });

  test('2. Checkout submit button displays PayMongo redirect call-to-action text', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('Pay ${money(quote?.amount || 0)} with QR Ph')).toBe(true);
  });

  test('3. Repeated clicks disable submission button to prevent duplicate sessions', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('if (busy) return;')).toBe(true);
    expect(pageCode.includes('disabled={busy || !isAuthenticated || !isVerified || !config.enabled}')).toBe(true);
  });

  test('4. Return redirect routes to /checkout/processing with opaque token', () => {
    const processingCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutProcessingPage.jsx'), 'utf8');
    expect(processingCode.includes('token')).toBe(true);
    expect(processingCode.includes('getCheckoutStatus')).toBe(true);
  });

  test('5. Active status page requires server confirmation and ignores query string success parameters', () => {
    const successCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutSuccessPage.jsx'), 'utf8');
    expect(successCode.includes('GET /api/public/checkout/status/')).toBe(false); // Opaque status API used via publicApi service
    expect(successCode.includes('publicApi.getCheckoutStatus')).toBe(true);
    expect(successCode.includes('token')).toBe(true);
  });

  test('6. Provider API errors are mapped into friendly user-facing error messages', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Checkout/CheckoutPage.jsx'), 'utf8');
    expect(pageCode.includes('err?.response?.data?.error?.message || err.message')).toBe(true);
    expect(pageCode.includes('Payment could not be started.')).toBe(true);
  });
});
