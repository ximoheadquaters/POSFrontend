/**
 * Centralized subscription date formatting and access state presentation helpers.
 * Ensures consistent timezone-aware formatting, safe fallbacks, and exact singular/plural day countdowns.
 */

/**
 * Format a subscription date with timezone support.
 * @param {Date|string|number} dateInput
 * @param {string} [timeZone='Asia/Manila']
 * @returns {string|null} - Formatted date string (e.g. "September 4, 2026") or null if invalid
 */
export function formatSubscriptionDate(dateInput, timeZone = 'Asia/Manila') {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  try {
    return date.toLocaleDateString('en-PH', {
      timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

/**
 * Calculate exact integer days remaining until a target date.
 * @param {Date|string|number} targetDateInput
 * @param {Date|string|number} [nowInput=new Date()]
 * @returns {number|null}
 */
export function getSubscriptionDaysRemaining(targetDateInput, nowInput = new Date()) {
  if (!targetDateInput) return null;
  const targetDate = new Date(targetDateInput);
  const nowDate = new Date(nowInput);

  if (isNaN(targetDate.getTime()) || isNaN(nowDate.getTime())) return null;
  if (nowDate >= targetDate) return 0;

  const diffMs = targetDate.getTime() - nowDate.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Format days remaining into singular or plural human-readable text.
 * @param {number|null} days
 * @param {'ends_in'|'remaining'} [style='ends_in']
 * @returns {string|null}
 */
export function formatSubscriptionCountdown(days, style = 'ends_in') {
  if (days === null || days === undefined || isNaN(days)) return null;

  const count = Math.max(0, Math.floor(days));
  const unit = count === 1 ? 'day' : 'days';

  if (style === 'remaining') {
    return `${count} ${unit} remaining`;
  }
  return `${count} ${unit}`;
}

/**
 * Determine exact subscription access state and boundaries.
 *
 * @param {object} subscription
 * @param {Date|string} [nowInput=new Date()]
 * @returns {{
 *   state: 'active' | 'grace' | 'suspended',
 *   formattedPeriodEnd: string | null,
 *   formattedGraceEnd: string | null,
 *   daysRemaining: number | null,
 *   countdownText: string | null,
 *   isSafe: boolean,
 *   fallbackMessage: string | null
 * }}
 */
export function getSubscriptionAccessState(subscription, nowInput = new Date()) {
  const safeFallback = 'We couldn’t determine your subscription end date. Contact Ximo support.';

  if (!subscription || !subscription.currentPeriodEnd) {
    return {
      state: 'suspended',
      formattedPeriodEnd: null,
      formattedGraceEnd: null,
      daysRemaining: null,
      countdownText: null,
      isSafe: false,
      fallbackMessage: safeFallback
    };
  }

  const periodEnd = new Date(subscription.currentPeriodEnd);
  if (isNaN(periodEnd.getTime())) {
    return {
      state: 'suspended',
      formattedPeriodEnd: null,
      formattedGraceEnd: null,
      daysRemaining: null,
      countdownText: null,
      isSafe: false,
      fallbackMessage: safeFallback
    };
  }

  const nowDate = new Date(nowInput);
  const formattedPeriodEnd = formatSubscriptionDate(periodEnd);

  // Grace period ends at subscription.gracePeriodEndsAt or 3 days post periodEnd
  let graceEnd = subscription.gracePeriodEndsAt ? new Date(subscription.gracePeriodEndsAt) : null;
  if (!graceEnd || isNaN(graceEnd.getTime())) {
    graceEnd = new Date(periodEnd.getTime() + 3 * 24 * 60 * 60 * 1000);
  }
  const formattedGraceEnd = formatSubscriptionDate(graceEnd);

  // Active state: now < periodEnd
  if (nowDate < periodEnd) {
    const daysRemaining = getSubscriptionDaysRemaining(periodEnd, nowDate);
    const countdownText = formatSubscriptionCountdown(daysRemaining, 'ends_in');
    return {
      state: 'active',
      formattedPeriodEnd,
      formattedGraceEnd,
      daysRemaining,
      countdownText,
      isSafe: true,
      fallbackMessage: null
    };
  }

  // Grace state: periodEnd <= now < graceEnd
  if (nowDate >= periodEnd && nowDate < graceEnd) {
    const daysRemaining = getSubscriptionDaysRemaining(graceEnd, nowDate);
    const countdownText = formatSubscriptionCountdown(daysRemaining, 'remaining');
    return {
      state: 'grace',
      formattedPeriodEnd,
      formattedGraceEnd,
      daysRemaining,
      countdownText,
      isSafe: true,
      fallbackMessage: null
    };
  }

  // Suspended post-grace
  return {
    state: 'suspended',
    formattedPeriodEnd,
    formattedGraceEnd,
    daysRemaining: 0,
    countdownText: '0 days',
    isSafe: true,
    fallbackMessage: null
  };
}
