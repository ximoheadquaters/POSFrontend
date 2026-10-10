const RETURN_DESTINATIONS = {
  checkout: '/checkout',
  'sign-in': '/login',
};

export function accountVerificationRedirectUrl(origin, next = 'sign-in') {
  const url = new URL('/account-verified', origin);
  url.searchParams.set('next', next === 'checkout' ? 'checkout' : 'sign-in');
  return url.toString();
}

export function accountVerificationNextPath(next) {
  return RETURN_DESTINATIONS[next] || RETURN_DESTINATIONS['sign-in'];
}
