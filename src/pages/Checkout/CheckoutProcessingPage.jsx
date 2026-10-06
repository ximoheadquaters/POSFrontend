import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { publicApi } from '../../services/publicApi';
import Button from '../../components/common/Button';

const STATUS_MESSAGES = {
  awaiting_verification: 'Verify your email to continue.',
  awaiting_payment: 'Waiting for payment confirmation.',
  processing: 'Confirming your payment.',
  provisioning: 'Setting up your Ximo POS workspace.',
  active: 'Your store is ready.',
  failed: 'We couldn’t finish setting up your store.',
  expired: 'This checkout session has expired.',
};

function StatusMark({ state }) {
  const isError = state === 'error';
  const isComplete = state === 'complete';

  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
        isError ? 'bg-red-100 text-red-700' : isComplete ? 'bg-[#E6F2E9] text-primary' : 'bg-[#F0F4F1] text-[#607467]'
      }`}
      aria-hidden="true"
    >
      {isError ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.9">
          <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.8 2.5 17.1A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.9L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        </svg>
      ) : isComplete ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.9">
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4.2 4.2L19 6.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin" stroke="currentColor" strokeWidth="1.9">
          <path strokeLinecap="round" d="M20 12a8 8 0 1 1-2.34-5.66" />
        </svg>
      )}
    </span>
  );
}

function ProgressStep({ label, detail, state = 'pending' }) {
  return (
    <li className="flex items-start gap-3">
      <StatusMark state={state} />
      <div className="min-w-0 pt-0.5">
        <p className={`text-sm font-semibold ${state === 'pending' ? 'text-[#607467]' : 'text-[#1F2923]'}`}>{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-[#66756A]">{detail}</p>
      </div>
    </li>
  );
}

function paymentProgress(status) {
  const confirmed = ['processing', 'provisioning', 'active'].includes(status);
  const activating = ['provisioning', 'active'].includes(status);

  return [
    {
      label: 'Payment confirmation',
      detail: status === 'awaiting_payment' ? 'Complete the secure QR Ph checkout in PayMongo.' : 'PayMongo has returned the payment result.',
      state: confirmed ? 'complete' : status === 'awaiting_payment' ? 'current' : 'pending',
    },
    {
      label: 'Workspace activation',
      detail: 'Ximo creates and connects your subscription workspace.',
      state: activating ? (status === 'active' ? 'complete' : 'current') : 'pending',
    },
    {
      label: 'Store access',
      detail: 'Your owner setup details are ready once activation completes.',
      state: status === 'active' ? 'complete' : 'pending',
    },
  ];
}

export default function CheckoutProcessingPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('processing');
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setError('No checkout session was provided. Return to checkout and try again.');
      return undefined;
    }

    let isMounted = true;
    let inFlight = false;

    const pollStatus = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await publicApi.getCheckoutStatus(token);
        if (!isMounted) return;

        const currentStatus = response?.status || 'processing';
        setStatus(currentStatus);
        setRedirectUrl(response?.redirectUrl || null);
        setError(null);

        if (currentStatus === 'active') {
          navigate(`/checkout/success?token=${token}`);
        } else if (currentStatus === 'failed') {
          navigate('/checkout/failed');
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('Status polling error:', err?.message);
        setError('We could not check the payment status just now. Your payment remains safe; do not pay again.');
      } finally {
        inFlight = false;
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, navigate, retryCount]);

  const steps = paymentProgress(status);

  return (
    <main className="min-h-screen bg-[#F8FAF8] px-4 pb-16 pt-28 sm:pt-32">
      <section className="mx-auto w-full max-w-xl border border-[#DCE8E1] bg-white p-5 shadow-sm sm:p-8" aria-live="polite">
        <header className="border-b border-[#E1E8E2] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Secure checkout</p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#17241C]">{STATUS_MESSAGES[status] || 'Processing your subscription.'}</h1>
          <p className="mt-2 text-sm leading-6 text-[#5D6D62]">Keep this page open while we confirm the payment and activate your Ximo POS workspace.</p>
        </header>

        {error ? (
          <div className="mt-6 border border-red-200 bg-red-50 p-4" role="status">
            <div className="flex items-start gap-3">
              <StatusMark state="error" />
              <div>
                <p className="font-semibold text-red-900">Status check unavailable</p>
                <p className="mt-1 text-sm leading-5 text-red-800">{error}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setRetryCount((value) => value + 1)}>Check again</Button>
              <Button variant="ghost" onClick={() => navigate('/checkout')}>Return to checkout</Button>
            </div>
          </div>
        ) : (
          <>
            {status === 'awaiting_payment' && redirectUrl && (
              <div className="mt-6 border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-950">Payment still needs confirmation</p>
                <p className="mt-1 text-sm leading-5 text-amber-900">Return to the PayMongo checkout to complete your QR Ph payment. Use this existing checkout—do not start a second payment.</p>
                <Button className="mt-4" onClick={() => window.location.assign(redirectUrl)}>Resume QR Ph payment</Button>
              </div>
            )}

            <ol className="mt-6 space-y-5">
              {steps.map((item) => <ProgressStep key={item.label} {...item} />)}
            </ol>

            <p className="mt-7 border-t border-[#E1E8E2] pt-5 text-xs leading-5 text-[#66756A]">We check automatically every 15 seconds. PayMongo sends the payment receipt; Ximo only enables access after the provider result is verified.</p>
          </>
        )}
      </section>
    </main>
  );
}
