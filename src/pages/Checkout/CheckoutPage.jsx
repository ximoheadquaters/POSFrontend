import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { publicApi } from '../../services/publicApi';
import CheckoutLoading from '../../components/common/CheckoutLoading';
import Button from '../../components/common/Button';

const STEPS = [
  'Business & software',
  'Package',
  'Add-ons',
  'Branches',
  'Review & terms',
  'Payment',
  'Confirmation',
];
const PROFILES = [
  ['retail', 'Retail'],
  ['food_service', 'Food service'],
  ['hybrid', 'Retail & food service'],
];
const DRAFT_KEY = 'ximo_subscription_order';
const money = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount / 100);
const inputClass =
  'mt-2 w-full min-h-12 rounded-xl border border-[#D4DDD5] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
const defaults = {
  softwareCode: 'ximo_pos',
  intendedBusinessProfile: 'retail',
  organizationName: '',
  planCode: '',
  addOnCodes: [],
  modificationRequest: '',
  branchCount: 1,
};
function readDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
    if (saved && Array.isArray(saved.addOnCodes)) return { ...defaults, ...saved };
  } catch {
    /* Continue with a new order if storage is unavailable. */
  }
  return defaults;
}

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(readDraft);
  const [step, setStep] = useState(() => {
    try {
      return Math.max(1, Math.min(Number(sessionStorage.getItem('ximo_checkout_step')) || 1, 4));
    } catch {
      return 1;
    }
  });
  const [plans, setPlans] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const selectedPlan = plans.find((plan) => plan.code === order.planCode);
  const catalog = config?.orderConfiguration;
  const includedModules = new Set(selectedPlan?.modules?.map((module) => module.code) || []);
  const isVerified = Boolean(user?.email_confirmed_at || user?.confirmed_at);

  useEffect(() => {
    let mounted = true;
    Promise.all([publicApi.getPublicPlans(), publicApi.getPaymentConfiguration()])
      .then(([availablePlans, paymentConfig]) => {
        if (!mounted) return;
        const available = availablePlans.filter((plan) => plan.availability === 'available');
        if (!available.length) throw new Error('No packages are currently available.');
        setPlans(available);
        setConfig(paymentConfig);
        setOrder((previous) => {
          const requested = params.get('plan') || previous.planCode;
          const planCode = available.some((plan) => plan.code === requested)
            ? requested
            : available[0].code;
          const profile = params.get('business');
          return {
            ...previous,
            planCode,
            ...(PROFILES.some(([code]) => code === profile)
              ? { intendedBusinessProfile: profile }
              : {}),
          };
        });
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Unable to load subscription options.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [params]);
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(order));
    } catch {
      /* Draft persistence is optional. */
    }
  }, [order]);
  useEffect(() => {
    try {
      sessionStorage.setItem('ximo_checkout_step', String(step));
    } catch {
      /* Continue without storage. */
    }
  }, [step]);

  function update(patch) {
    setOrder((previous) => ({ ...previous, ...patch }));
    setQuote(null);
    setAccepted(false);
    setError('');
  }
  async function next() {
    setError('');
    if (step === 1 && !order.organizationName.trim())
      return setError('Enter your business name to continue.');
    if (step === 4) {
      setBusy(true);
      try {
        setQuote(await publicApi.quoteCheckout({ ...order, termsVersion: catalog?.termsVersion }));
        setStep(5);
      } catch (err) {
        setError(
          err?.response?.data?.error?.message ||
            'We could not calculate this order. Please try again.',
        );
      } finally {
        setBusy(false);
      }
      return;
    }
    if (step === 5 && !accepted)
      return setError('Accept the Terms and Agreement before continuing.');
    setStep((value) => Math.min(value + 1, 6));
  }
  async function pay() {
    if (busy) return;
    if (!accepted || !quote) {
      setStep(4);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await publicApi.createCheckoutSession({
        ...order,
        organizationName: order.organizationName.trim(),
        ownerEmail: user.email,
        billingInterval: 'monthly',
        currency: 'PHP',
        termsAccepted: accepted,
        termsVersion: catalog.termsVersion,
        reviewedAmount: quote.amount,
      });
      if (!result.redirectUrl)
        throw new Error('The payment link is unavailable. Please try again.');
      window.location.assign(result.redirectUrl);
    } catch (err) {
      setError(
        err?.response?.data?.error?.message || err.message || 'Payment could not be started.',
      );
      if (err?.response?.data?.error?.code === 'ORDER_PRICE_CHANGED') {
        setStep(4);
        setAccepted(false);
        setQuote(null);
      }
      setBusy(false);
    }
  }
  if (loading) return <CheckoutLoading />;
  if (!catalog || !selectedPlan)
    return (
      <main className="pt-32 px-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Subscription setup</h1>
        <p role="alert" className="my-6">
          {error || 'Subscription options are unavailable.'}
        </p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </main>
    );
  const estimatedTotal =
    Math.round(Number(selectedPlan.monthlyPrice) * 100) +
    catalog.addOns
      .filter((item) => order.addOnCodes.includes(item.code))
      .reduce((sum, item) => sum + item.monthlyPrice * 100, 0) +
    Math.max(0, (order.branchCount || 1) - catalog.includedBranches) *
      catalog.extraBranchMonthlyPrice *
      100;

  return (
    <main className="min-h-screen bg-[#F8FAF8] px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Build your Ximo subscription
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F2923]">Your business. Your package.</h1>
          <p className="mt-2 text-sm text-[#5A685D]">
            Choose your setup, review the complete price, then pay securely.
          </p>
        </header>
        <nav
          aria-label="Subscription progress"
          className="overflow-x-auto rounded-2xl border bg-white p-4"
        >
          <ol className="flex min-w-[680px] gap-3">
            {STEPS.map((title, index) => (
              <li
                key={title}
                aria-current={step === index + 1 ? 'step' : undefined}
                className={`flex-1 text-xs ${step === index + 1 ? 'font-bold text-primary' : 'text-[#68736A]'}`}
              >
                <span
                  className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full ${step >= index + 1 ? 'bg-primary text-white' : 'bg-[#EDF1ED]'}`}
                >
                  {index + 1}
                </span>
                {title}
              </li>
            ))}
          </ol>
        </nav>
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
          <section className="space-y-6 rounded-3xl border border-[#D4DDD5] bg-white p-5 sm:p-8">
            <div>
              <p className="text-xs font-semibold text-primary">Step {step} of 7</p>
              <h2 className="mt-1 text-2xl font-bold">{STEPS[step - 1]}</h2>
            </div>
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}
            {step === 1 && (
              <div className="space-y-5">
                <label className="block text-sm font-semibold">
                  Business name
                  <input
                    maxLength={200}
                    value={order.organizationName}
                    onChange={(e) => update({ organizationName: e.target.value })}
                    placeholder="Your business name"
                    className={inputClass}
                  />
                </label>
                <fieldset className="space-y-3">
                  <legend className="mb-2 text-sm font-semibold">
                    Which software do you need?
                  </legend>
                  {catalog.software.map((software) => (
                    <label
                      key={software.code}
                      className="flex items-center gap-3 rounded-xl border border-primary bg-[#F0F6F1] p-4"
                    >
                      <input
                        type="radio"
                        name="software"
                        checked={order.softwareCode === software.code}
                        onChange={() => update({ softwareCode: software.code })}
                      />
                      <span className="font-semibold">{software.name}</span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="space-y-3">
                  <legend className="mb-2 text-sm font-semibold">Business type</legend>
                  {PROFILES.map(([code, title]) => (
                    <label
                      key={code}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${order.intendedBusinessProfile === code ? 'border-primary bg-[#F0F6F1]' : 'border-[#D4DDD5]'}`}
                    >
                      <input
                        type="radio"
                        name="businessProfile"
                        checked={order.intendedBusinessProfile === code}
                        onChange={() => update({ intendedBusinessProfile: code })}
                      />
                      <span className="text-sm font-semibold">{title}</span>
                    </label>
                  ))}
                </fieldset>
              </div>
            )}
            {step === 2 && (
              <fieldset className="space-y-4">
                <legend className="mb-3 text-sm text-[#5A685D]">
                  Choose a fixed-price package. Only the listed modules are included.
                </legend>
                {plans.map((plan) => (
                  <label
                    key={plan.code}
                    className={`block cursor-pointer rounded-2xl border p-5 ${order.planCode === plan.code ? 'border-primary bg-[#F0F6F1]' : 'border-[#D4DDD5]'}`}
                  >
                    <span className="flex flex-wrap items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        checked={order.planCode === plan.code}
                        onChange={() => update({ planCode: plan.code, addOnCodes: [] })}
                      />
                      <span className="flex-1 font-bold">{plan.displayName}</span>
                      <span className="font-bold">{money(plan.monthlyPrice * 100)}/mo</span>
                    </span>
                    <p className="mt-3 text-sm text-[#5A685D]">{plan.shortDescription}</p>
                    <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                      {plan.features.map((feature) => (
                        <li key={feature}>✓ {feature}</li>
                      ))}
                    </ul>
                  </label>
                ))}
              </fieldset>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-[#5A685D]">
                  Included modules are already covered by your package.
                </p>
                {catalog.addOns.map((addOn) => {
                  const included = addOn.moduleCodes.every((code) => includedModules.has(code));
                  return (
                    <label
                      key={addOn.code}
                      className="flex items-center gap-3 rounded-xl border p-4"
                    >
                      <input
                        type="checkbox"
                        disabled={included}
                        checked={included || order.addOnCodes.includes(addOn.code)}
                        onChange={(e) =>
                          update({
                            addOnCodes: e.target.checked
                              ? [...order.addOnCodes, addOn.code]
                              : order.addOnCodes.filter((code) => code !== addOn.code),
                          })
                        }
                      />
                      <span className="flex-1 text-sm font-semibold">{addOn.name}</span>
                      <span className="text-sm">
                        {included ? 'Included' : `${money(addOn.monthlyPrice * 100)}/mo`}
                      </span>
                    </label>
                  );
                })}
                <label className="block pt-3 text-sm font-semibold">
                  Specific modifications (optional)
                  <textarea
                    value={order.modificationRequest}
                    maxLength={2000}
                    onChange={(e) => update({ modificationRequest: e.target.value })}
                    rows={4}
                    className={inputClass}
                    placeholder="Describe any special workflow, integration, or customization."
                  />
                </label>
                <p className="text-xs text-[#5A685D]">
                  Custom work is saved as a request for a separate quote. It is not included in this
                  payment or automatic activation.
                </p>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-5">
                <p className="text-sm text-[#5A685D]">
                  One branch is included. Each additional branch adds{' '}
                  {money(catalog.extraBranchMonthlyPrice * 100)} per month.
                </p>
                <label className="block text-sm font-semibold">
                  Number of branches
                  <input
                    type="number"
                    min={order.addOnCodes.includes('stock_transfers') ? 2 : 1}
                    max={catalog.maxBranches}
                    step={1}
                    value={order.branchCount}
                    onChange={(e) =>
                      update({ branchCount: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </label>
                <p className="text-xs text-[#5A685D]">
                  Branches are created after payment. Rename them and enter addresses in Ximo POS.
                </p>
                {order.addOnCodes.includes('stock_transfers') && (
                  <p className="text-xs text-primary">
                    Stock transfers require at least two branches.
                  </p>
                )}
              </div>
            )}
            {step === 5 && quote && (
              <div className="space-y-5">
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <dt>Business</dt>
                  <dd>{order.organizationName}</dd>
                  <dt>Software / type</dt>
                  <dd>
                    Ximo POS ·{' '}
                    {PROFILES.find(([code]) => code === order.intendedBusinessProfile)?.[1]}
                  </dd>
                  <dt>Branches</dt>
                  <dd>{order.branchCount}</dd>
                </dl>
                <div className="divide-y rounded-xl border px-4">
                  {quote.lineItems.map((line) => (
                    <div key={line.code} className="flex justify-between gap-3 py-3 text-sm">
                      <span>
                        {line.name}
                        {line.quantity > 1 ? ` × ${line.quantity}` : ''}
                      </span>
                      <span>{money(line.unitAmount * line.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-4 font-bold">
                    <span>Total due / month</span>
                    <span>{money(quote.amount)}</span>
                  </div>
                </div>
                {order.modificationRequest && (
                  <div className="rounded-xl bg-amber-50 p-4 text-sm">
                    <p className="font-semibold">Custom request — separate quote required</p>
                    <p className="mt-2 whitespace-pre-wrap">{order.modificationRequest}</p>
                    <p className="mt-2 text-xs">
                      The total covers your package, add-ons, and branches only.
                    </p>
                  </div>
                )}
                <p className="text-sm text-[#5A685D]">
                  Pay for one month. QR Ph renewals require a new payment; automatic charges are not
                  enabled.
                </p>
                <a
                  href={catalog.termsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block font-semibold text-primary underline"
                >
                  Read the Terms and Agreement ↗
                </a>
                <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I have reviewed my order and accept the Terms and Agreement. Custom
                    modifications require a separate quote.
                  </span>
                </label>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-5">
                <p className="text-sm text-[#5A685D]">
                  Your order is confirmed for {money(quote?.amount || 0)}. Identify the subscription
                  owner, then continue to secure payment.
                </p>
                {!isAuthenticated ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      to={`/signup?plan=${encodeURIComponent(order.planCode)}`}
                      className="rounded-xl bg-primary p-4 text-center text-sm font-bold text-white"
                    >
                      Create an account
                    </Link>
                    <Link
                      to="/login?redirect=/checkout"
                      className="rounded-xl border p-4 text-center text-sm font-bold text-primary"
                    >
                      Sign in
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#F0F6F1] p-4">
                    <p className="text-sm">
                      Subscription owner: <strong>{user?.email}</strong>
                    </p>
                    {!isVerified && (
                      <p className="mt-3 text-sm text-amber-800">
                        Verify your email using the link in your inbox, then return to pay.
                      </p>
                    )}
                  </div>
                )}
                <div className="rounded-xl border p-4 text-sm">
                  <h3 className="font-bold">QR Ph via PayMongo</h3>
                  <p className="mt-2 text-[#5A685D]">
                    On your first purchase, enter or confirm your billing details on PayMongo, then
                    scan the QR code with your bank or e-wallet. QR Ph requires a new authorization
                    for every purchase.
                  </p>
                  <p className="mt-2 text-[#5A685D]">
                    After payment, you’ll receive a receipt and see your activation status.
                  </p>
                  {config.testMode && (
                    <p className="mt-3 font-semibold text-amber-800">
                      Test checkout — no real payment is collected.
                    </p>
                  )}
                </div>
                {!config.enabled && (
                  <p role="status" className="text-sm text-amber-800">
                    Online payment is currently unavailable.
                  </p>
                )}
                <Button
                  className="w-full"
                  disabled={busy || !isAuthenticated || !isVerified || !config.enabled}
                  onClick={pay}
                >
                  {busy ? 'Opening secure payment…' : `Pay ${money(quote?.amount || 0)} with QR Ph`}
                </Button>
              </div>
            )}
            <div className="flex gap-3 border-t pt-5">
              {step > 1 && (
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    setError('');
                    setStep((value) => value - 1);
                  }}
                >
                  Back
                </Button>
              )}
              {step < 6 && (
                <Button
                  className="flex-1"
                  disabled={busy || (step === 5 && !accepted)}
                  onClick={next}
                >
                  {busy
                    ? 'Calculating order…'
                    : step === 5
                      ? 'Confirm order & continue'
                      : 'Continue'}
                </Button>
              )}
            </div>
          </section>
          <aside className="rounded-2xl border bg-white p-5 lg:sticky lg:top-28">
            <h2 className="text-sm font-bold">Your subscription</h2>
            <p className="mt-4 text-sm">Ximo POS · {selectedPlan.displayName}</p>
            <p className="mt-2 text-xs text-[#5A685D]">
              {order.branchCount || 1} branch(es) · {order.addOnCodes.length} add-on(s)
            </p>
            <p className="mt-5 text-2xl font-bold text-primary">
              {money(quote?.amount ?? estimatedTotal)}
              <span className="text-xs font-normal"> / month</span>
            </p>
            <p className="mt-2 text-xs text-[#5A685D]">
              {quote
                ? 'Order total confirmed. Custom work quoted separately.'
                : 'Review the complete order before payment.'}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
