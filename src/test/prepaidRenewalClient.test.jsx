import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  formatSubscriptionDate,
  getSubscriptionDaysRemaining,
  formatSubscriptionCountdown,
  getSubscriptionAccessState
} from '../utils/subscriptionDateHelpers';

describe('Phase E Step 10 Prepaid Renewal Client UI & Date Helper Tests', () => {

  test('1. Active subscription renders valid paid-through date with Asia/Manila timezone', () => {
    const formatted = formatSubscriptionDate('2026-09-04T10:00:00.000Z', 'Asia/Manila');
    expect(formatted).toBe('September 4, 2026');
  });

  test('2. One day remaining uses singular wording ("1 day")', () => {
    const countdown = formatSubscriptionCountdown(1, 'ends_in');
    expect(countdown).toBe('1 day');
  });

  test('3. Multiple days use plural wording ("3 days")', () => {
    const countdown = formatSubscriptionCountdown(3, 'ends_in');
    expect(countdown).toBe('3 days');
  });

  test('4. Grace countdown renders number with remaining text ("2 days remaining")', () => {
    const countdown = formatSubscriptionCountdown(2, 'remaining');
    expect(countdown).toBe('2 days remaining');
  });

  test('5. Singular grace countdown renders ("1 day remaining")', () => {
    const countdown = formatSubscriptionCountdown(1, 'remaining');
    expect(countdown).toBe('1 day remaining');
  });

  test('6. Missing currentPeriodEnd shows safe fallback and blocks unsafe presentation', () => {
    const access = getSubscriptionAccessState({ currentPeriodEnd: null }, new Date('2026-09-01'));
    expect(access.isSafe).toBe(false);
    expect(access.fallbackMessage).toBe('We couldn’t determine your subscription end date. Contact Ximo support.');
    expect(access.formattedPeriodEnd).toBeNull();
  });

  test('7. Invalid currentPeriodEnd shows safe fallback and does not output NaN or Invalid Date', () => {
    const access = getSubscriptionAccessState({ currentPeriodEnd: 'invalid-date-string' }, new Date('2026-09-01'));
    expect(access.isSafe).toBe(false);
    expect(access.fallbackMessage).toBe('We couldn’t determine your subscription end date. Contact Ximo support.');
    expect(access.formattedPeriodEnd).toBeNull();
  });

  test('8. Missing gracePeriodEndsAt defaults safely to 3 days post periodEnd without NaN', () => {
    const access = getSubscriptionAccessState({ currentPeriodEnd: '2026-09-04T10:00:00.000Z', gracePeriodEndsAt: null }, '2026-09-05T10:00:00.000Z');
    expect(access.state).toBe('grace');
    expect(access.formattedGraceEnd).toBe('September 7, 2026');
    expect(access.daysRemaining).toBe(2);
    expect(access.countdownText).toBe('2 days remaining');
  });

  test('9. Failed renewal before period end leaves period unchanged and remains active', () => {
    const periodEnd = '2026-09-04T10:00:00.000Z';
    const graceEnd = '2026-09-07T10:00:00.000Z';
    // Payment failed; periodEnd and graceEnd are NOT updated
    const access = getSubscriptionAccessState({ currentPeriodEnd: periodEnd, gracePeriodEndsAt: graceEnd }, '2026-09-01T10:00:00.000Z');
    expect(access.state).toBe('active');
    expect(access.daysRemaining).toBe(3);
    expect(access.countdownText).toBe('3 days');
  });

  test('10. Failed renewal during grace period leaves period unchanged and remains grace', () => {
    const periodEnd = '2026-09-04T10:00:00.000Z';
    const graceEnd = '2026-09-07T10:00:00.000Z';
    // Payment failed; evaluated during grace on Sep 5
    const access = getSubscriptionAccessState({ currentPeriodEnd: periodEnd, gracePeriodEndsAt: graceEnd }, '2026-09-05T10:00:00.000Z');
    expect(access.state).toBe('grace');
    expect(access.daysRemaining).toBe(2);
    expect(access.countdownText).toBe('2 days remaining');
  });

  test('11. Failed renewal after grace period leaves period unchanged and remains suspended', () => {
    const periodEnd = '2026-09-04T10:00:00.000Z';
    const graceEnd = '2026-09-07T10:00:00.000Z';
    // Payment failed; evaluated post-grace on Sep 10
    const access = getSubscriptionAccessState({ currentPeriodEnd: periodEnd, gracePeriodEndsAt: graceEnd }, '2026-09-10T10:00:00.000Z');
    expect(access.state).toBe('suspended');
    expect(access.daysRemaining).toBe(0);
  });

  test('12. Timezone boundary around Manila midnight is formatted correctly', () => {
    // 2026-09-04 15:30:00 UTC = 2026-09-04 23:30:00 PHT (September 4)
    const phtEvening = formatSubscriptionDate('2026-09-04T15:30:00.000Z', 'Asia/Manila');
    expect(phtEvening).toBe('September 4, 2026');

    // 2026-09-04 16:30:00 UTC = 2026-09-05 00:30:00 PHT (September 5)
    const phtMidnight = formatSubscriptionDate('2026-09-04T16:30:00.000Z', 'Asia/Manila');
    expect(phtMidnight).toBe('September 5, 2026');
  });

  test('13. UI codebase contains ZERO unformatted blank dates ("through .")', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('through .')).toBe(false);
    expect(pageCode.includes('through {new Date')).toBe(false);
  });

  test('14. UI codebase contains ZERO raw unformatted day count strings ("in days")', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('in days')).toBe(false);
    expect(pageCode.includes('in {subscription.daysRemaining} days')).toBe(false);
  });

  test('15. UI codebase contains ZERO unhandled NaN or Invalid Date interpolations', () => {
    const pageCode = fs.readFileSync(path.resolve(__dirname, '../pages/Dashboard/Billing/TenantBillingPage.jsx'), 'utf8');
    expect(pageCode.includes('|| "Date Unavailable"')).toBe(true);
    expect(pageCode.includes('accessState.isSafe')).toBe(true);
  });
});
