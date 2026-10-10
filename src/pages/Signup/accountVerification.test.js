import { describe, expect, test } from 'vitest';
import {
  accountVerificationNextPath,
  accountVerificationRedirectUrl,
} from './accountVerification';

describe('account verification redirects', () => {
  test('uses the active application origin instead of the Supabase Site URL fallback', () => {
    expect(
      accountVerificationRedirectUrl('https://portal.ximo.example', 'checkout'),
    ).toBe('https://portal.ximo.example/account-verified?next=checkout');
  });

  test('only returns users to approved local routes', () => {
    expect(accountVerificationNextPath('checkout')).toBe('/checkout');
    expect(accountVerificationNextPath('anything-else')).toBe('/login');
  });
});
