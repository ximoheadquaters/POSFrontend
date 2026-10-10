import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import XimoIconGreen from '../../assets/greenXimo.PNG';
import { supabase } from '../../config/supabase';
import { accountVerificationNextPath } from './accountVerification';

function VerificationMark({ state }) {
  const failed = state === 'failed';

  return (
    <span
      className={`grid h-14 w-14 place-items-center rounded-2xl ${
        failed ? 'bg-[#FCECEA] text-[#A13A32]' : 'bg-[#E5F1E8] text-[#1A593B]'
      }`}
      aria-hidden="true"
    >
      {failed ? (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.8 2.5 17.1A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.9L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        </svg>
      ) : state === 'checking' ? (
        <svg className="h-7 w-7 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" d="M20 12a8 8 0 1 1-2.34-5.66" />
        </svg>
      ) : (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4.2 4.2L19 6.5" />
        </svg>
      )}
    </span>
  );
}

export default function AccountVerifiedPage() {
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');
  const returnPath = accountVerificationNextPath(next);
  const returnToCheckout = returnPath === '/checkout';
  const [state, setState] = useState('checking');
  const [error, setError] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    const code = searchParams.get('code');
    const authError = searchParams.get('error_description') || searchParams.get('error');

    async function confirmEmail() {
      if (authError) {
        if (!active) return;
        setError('This verification link is no longer valid. Request a new confirmation email and try again.');
        setState('failed');
        return;
      }

      try {
        let { data } = await supabase.auth.getSession();

        if (!data.session && code) {
          const result = await supabase.auth.exchangeCodeForSession(code);
          if (result.error) {
            ({ data } = await supabase.auth.getSession());
          }
        }

        if (!active) return;
        if (data.session || code || window.location.hash.includes('access_token=')) {
          setSignedIn(Boolean(data.session));
          setState('verified');
          return;
        }

        setError('This page needs a confirmation link from your email.');
        setState('failed');
      } catch {
        if (!active) return;
        setError('We could not confirm this link. It may have expired or already been used.');
        setState('failed');
      }
    }

    void confirmEmail();
    return () => {
      active = false;
    };
  }, [searchParams]);

  const verifiedActionPath =
    returnToCheckout && !signedIn ? '/login?redirect=/checkout' : returnPath;
  const content =
    state === 'verified'
      ? {
          title: 'Account verified.',
          body: returnToCheckout && signedIn
            ? 'Your email is confirmed. Continue to checkout when you are ready to set up Ximo POS.'
            : returnToCheckout
              ? 'Your email is confirmed. Sign in to continue with your Ximo POS checkout.'
            : 'Your email is confirmed. Sign in to continue to your Ximo workspace.',
          action:
            returnToCheckout && signedIn
              ? 'Continue to checkout'
              : 'Sign in to Ximo',
        }
      : state === 'failed'
        ? {
            title: 'We could not verify this email.',
            body: error,
            action: 'Create a new account',
          }
        : {
            title: 'Confirming your email…',
            body: 'Please wait while we verify your account.',
            action: '',
          };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F7F4] px-5 py-10 sm:px-8">
      <section className="w-full max-w-md border border-[#D5E1D8] bg-white p-6 sm:p-8" aria-live="polite">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A593B] hover:underline">
          <img src={XimoIconGreen} alt="" className="h-7 w-7 object-contain" />
          Ximo
        </Link>

        <div className="mt-10">
          <VerificationMark state={state} />
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#15251B]">{content.title}</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#647168]">{content.body}</p>
        </div>

        {state !== 'checking' && (
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={state === 'verified' ? verifiedActionPath : '/signup'}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1A593B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#12472E] focus:outline-none focus:ring-2 focus:ring-[#1A593B] focus:ring-offset-2"
            >
              {content.action}
            </Link>
            {state === 'failed' && (
              <Link to="/login" className="text-sm font-semibold text-[#1A593B] hover:underline">
                Sign in instead
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
