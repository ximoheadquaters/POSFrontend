import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../config/supabase";
import useAuth from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import XimoIconGreen from "../../assets/greenXimo.PNG";

const ADMIN_ROLES = new Set(["super_admin", "super-admin", "superadmin"]);

function BackArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
    </svg>
  );
}

function FieldIcon({ kind }) {
  if (kind === "person") {
    return (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3.25" />
        <path
          strokeLinecap="round"
          d="M4.5 20c.8-3.4 3.4-5.2 7.5-5.2s6.7 1.8 7.5 5.2"
        />
      </svg>
    );
  }

  if (kind === "email") {
    return (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 7 7.5 5.2L19.5 7"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="5.25" y="10.25" width="13.5" height="9" rx="2" />
      <path
        strokeLinecap="round"
        d="M8.25 10.25V7.75a3.75 3.75 0 1 1 7.5 0v2.5"
      />
      <path strokeLinecap="round" d="M12 14.25v1.5" />
    </svg>
  );
}

function PasswordVisibilityIcon({ isVisible }) {
  if (isVisible) {
    return (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.9 10.9 0 0 1 12 4c5.3 0 8.8 4.1 9.7 6.1a1.8 1.8 0 0 1 0 1.8 12.7 12.7 0 0 1-3 3.8M6.2 6.2a12.7 12.7 0 0 0-3.9 3.9 1.8 1.8 0 0 0 0 1.8C3.2 13.9 6.7 18 12 18c.8 0 1.6-.1 2.3-.3"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function AccountField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  isPassword,
  isVisible,
  onToggleVisibility,
  action,
  minLength,
}) {
  const inputType = isPassword ? (isVisible ? "text" : "password") : type;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor={name}
          className="block text-[13px] font-semibold text-[#34453A]"
        >
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#738078] transition-colors peer-focus:text-[#1A593B]">
          <FieldIcon kind={icon} />
        </span>
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className="peer w-full rounded-2xl border border-[#D2DDD5] bg-[#FBFCFB] py-3.5 pl-12 pr-12 text-sm text-[#17241C] outline-none transition placeholder:text-[#98A29B] hover:border-[#B9CABD] focus:border-[#1A593B] focus:bg-white focus:shadow-[0_0_0_4px_rgba(26,89,59,0.08)]"
        />
        {isPassword && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-[#68736A] transition hover:bg-[#EFF5F0] hover:text-primary"
            aria-label={
              isVisible
                ? "Hide " + label.toLowerCase()
                : "Show " + label.toLowerCase()
            }
            aria-pressed={isVisible}
          >
            <PasswordVisibilityIcon isVisible={isVisible} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function SignupPage({ initialMode = "signup" }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const {
    signIn,
    isLoading: signInLoading,
    error: authError,
    clearError,
  } = useAuth();
  const planFromUrl = searchParams.get("plan");
  const routeMode = initialMode === "signin" ? "signin" : "signup";
  const shouldReturnToCheckout = searchParams.get("redirect") === "/checkout";

  const [mode, setMode] = useState(routeMode);
  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState("");
  const [existingUserNotice, setExistingUserNotice] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  useEffect(() => {
    if (planFromUrl) {
      sessionStorage.setItem("ximo_selected_plan", planFromUrl);
    }
  }, [planFromUrl]);

  useEffect(() => {
    setMode(routeMode);
    setFormError(null);
    setNotice("");
    setExistingUserNotice(false);
    setVerificationSent(false);
    clearError();
  }, [clearError, routeMode]);

  const signupPath =
    "/signup" + (planFromUrl ? "?plan=" + encodeURIComponent(planFromUrl) : "");
  const checkoutPath =
    "/checkout" +
    (planFromUrl ? "?plan=" + encodeURIComponent(planFromUrl) : "");
  const loginPath = planFromUrl ? "/login?redirect=/checkout" : "/login";
  const authenticatedSignupPath = planFromUrl ? checkoutPath : "/pricing";

  const switchAuthMode = (nextMode) => {
    clearError();
    setFormError(null);
    setNotice("");
    setExistingUserNotice(false);
    setVerificationSent(false);
    setMode(nextMode);
    navigate(nextMode === "signup" ? signupPath : loginPath);
  };

  const showPasswordReset = () => {
    clearError();
    setFormError(null);
    setNotice("");
    setMode("reset");
  };

  const isSignupMode = mode === "signup";
  const isSignInMode = mode === "signin";
  const isResetMode = mode === "reset";
  const visibleError = formError || (isSignupMode ? null : authError);
  const headerCopy = isSignInMode
    ? {
        eyebrow: "Secure sign in",
        title: "Welcome back.",
        body: "Sign in to continue to your Ximo workspace.",
      }
    : isResetMode
      ? {
          eyebrow: "Account recovery",
          title: "Reset your password.",
          body: "We will email a secure recovery link to your account.",
        }
      : {
          eyebrow: "Ximo account",
          title: "Create your account.",
          body: "Set up your Ximo workspace and keep the work moving from day one.",
          compactBody: "Set up your Ximo workspace in minutes.",
        };

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setFormError(null);
    setNotice("");
    setExistingUserNotice(false);
    clearError();
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (signupLoading) return;

    setFormError(null);
    setExistingUserNotice(false);

    if (!formData.ownerName.trim()) {
      setFormError("Please enter your name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match. Please re-enter your password.");
      return;
    }

    setSignupLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            display_name: formData.ownerName.trim(),
          },
        },
      });

      if (signUpError) {
        const message = signUpError.message.toLowerCase();
        if (
          message.includes("already registered") ||
          message.includes("already exists") ||
          message.includes("email address")
        ) {
          setExistingUserNotice(true);
        } else {
          setFormError(
            signUpError.message ||
              "Unable to create account. Please try again.",
          );
        }
        return;
      }

      if (
        data?.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        setExistingUserNotice(true);
        return;
      }

      if (data?.session) {
        navigate(authenticatedSignupPath, { replace: true });
        return;
      }

      setVerificationSent(true);
    } catch (signupError) {
      setFormError(
        signupError?.message ||
          "An unexpected error occurred during account creation.",
      );
    } finally {
      setSignupLoading(false);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (signInLoading) return;

    setFormError(null);
    setNotice("");
    clearError();

    try {
      const auth = await signIn(formData.email, formData.password);
      navigate(
        shouldReturnToCheckout
          ? "/checkout"
          : ADMIN_ROLES.has(String(auth.role).toLowerCase())
            ? "/admin"
            : "/client",
        { replace: true },
      );
    } catch {
      // The auth error is rendered from the shared auth state.
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (resetLoading) return;

    setResetLoading(true);
    setFormError(null);
    setNotice("");
    clearError();

    try {
      await authService.sendPasswordReset(formData.email);
      setNotice(
        "If an account exists for that email, a password reset link has been sent.",
      );
    } catch (resetError) {
      setFormError(resetError.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = isSignupMode
    ? handleSignup
    : isSignInMode
      ? handleSignIn
      : handleReset;
  const isSubmitting = signupLoading || signInLoading || resetLoading;
  const submitLabel = isSignupMode
    ? signupLoading
      ? "Creating account..."
      : "Create account"
    : isSignInMode
      ? signInLoading
        ? "Signing in..."
        : "Sign in"
      : resetLoading
        ? "Sending link..."
        : "Send reset link";

  return (
    <main className="min-h-screen bg-[#F3F7F4] lg:grid lg:grid-cols-[minmax(400px,0.92fr)_minmax(560px,1.08fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[linear-gradient(145deg,#103F29_0%,#1A593B_55%,#23734D_100%)] px-12 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
        <div className="absolute -bottom-24 -right-28 h-[520px] w-[520px] rounded-full border border-white/10" />
        <div className="absolute -bottom-5 -right-6 h-[360px] w-[360px] rounded-full border border-white/10" />
        <img src={XimoIconGreen} alt="" className="absolute -right-20 top-[14%] h-[440px] w-[440px] rotate-[-8deg] object-contain opacity-[0.08] brightness-0 invert" />

        <Link to="/" className="relative inline-flex w-fit items-center gap-3" aria-label="Ximo home">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_12px_30px_rgba(4,33,20,0.18)]">
            <img src={XimoIconGreen} alt="" className="h-9 w-9 object-contain" />
          </span>
          <span className="text-3xl font-semibold tracking-[-0.07em]">ximo</span>
        </Link>

        <div className="relative my-auto max-w-lg py-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#BDE5CA]">Your business, in rhythm</p>
          <h2 className="mt-5 text-[2.9rem] font-semibold leading-[1.02] tracking-[-0.055em] xl:text-[3.6rem]">
            Start the day ready for what comes next.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/72">
            One connected workspace for sales, inventory, customers, and the decisions that keep your business moving.
          </p>
          <div className="mt-8 overflow-hidden rounded-[26px] border border-white/15 bg-white/[0.09] p-4 shadow-[0_24px_60px_rgba(3,31,18,0.2)] backdrop-blur-md xl:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#C9E7D2]">Today at a glance</p><p className="mt-1 text-sm text-white/60">Store performance</p></div>
            </div>
            <div className="grid grid-cols-3 gap-3 py-4">
              {[{ label: "Sales", value: "₱48.2k" }, { label: "Orders", value: "126" }, { label: "Stock", value: "98%" }].map((item) => <div key={item.label} className="rounded-2xl bg-white/[0.08] p-3"><p className="text-[10px] uppercase tracking-wider text-white/45">{item.label}</p><p className="mt-2 text-lg font-semibold tracking-[-0.03em]">{item.value}</p></div>)}
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white p-3.5 text-[#173B28]">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E7F3EA] text-[#1A593B]">✓</span><div><p className="text-xs font-semibold">Everything is in sync</p><p className="mt-0.5 text-[10px] text-[#738078]">Updated just now</p></div></div>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} Ximo Business Technology</p>
      </section>

      <section className="relative flex min-h-screen items-center overflow-hidden px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[440px] w-[440px] rounded-full bg-[#DDEDE2]/55 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-44 left-1/4 h-[360px] w-[360px] rounded-full bg-white blur-3xl" />
        <Link to="/" className="absolute left-5 top-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#D9E3DB] bg-white px-4 text-sm font-semibold text-[#355342] shadow-sm transition hover:border-[#1A593B] hover:text-[#1A593B] sm:left-8 sm:top-8 lg:left-12" aria-label="Back to home">
          <BackArrowIcon />
          <span>Home</span>
        </Link>

        <div className="relative mx-auto w-full max-w-[500px] pt-16 lg:pt-0">
          <Link to="/" className="mb-10 inline-flex items-center gap-3 lg:hidden" aria-label="Ximo home">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E5F1E8]">
              <img src={XimoIconGreen} alt="" className="h-8 w-8 object-contain" />
            </span>
            <span className="text-2xl font-semibold tracking-[-0.06em] text-[#1A593B]">ximo</span>
          </Link>

          <motion.div layout="position" transition={reduceMotion ? { duration: 0 } : { layout: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } }} className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_28px_80px_rgba(29,66,43,0.12)] backdrop-blur-sm sm:p-8 lg:p-9">
            <AnimatePresence initial={false} mode="wait">
              <motion.div key={mode + (verificationSent ? "-verified" : "-form")} initial={reduceMotion ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -8 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}>
                <div className="flex items-start gap-4">
                  <span className="mt-1 hidden h-12 w-1.5 rounded-full bg-[#1A593B] sm:block" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A593B]">{headerCopy.eyebrow}</p>
                    <h1 className="mt-3 text-[2.35rem] font-semibold leading-none tracking-[-0.055em] text-[#15251B] sm:text-[2.8rem]">{headerCopy.title}</h1>
                    <p className="mt-4 max-w-md text-sm leading-6 text-[#647168]">{headerCopy.body}</p>
                  </div>
                </div>

                {!isResetMode && (
                  <div role="tablist" aria-label="Account access" className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-[#EDF3EE] p-1.5">
                    <button type="button" onClick={() => switchAuthMode("signup")} role="tab" aria-selected={isSignupMode} className={"min-h-11 rounded-xl text-sm font-semibold transition " + (isSignupMode ? "bg-[#1A593B] text-white shadow-md" : "text-[#657269] hover:bg-[#EEF4EF] hover:text-[#1A593B]")}>Create account</button>
                    <button type="button" onClick={() => switchAuthMode("signin")} role="tab" aria-selected={isSignInMode} className={"min-h-11 rounded-xl text-sm font-semibold transition " + (isSignInMode ? "bg-[#1A593B] text-white shadow-md" : "text-[#657269] hover:bg-[#EEF4EF] hover:text-[#1A593B]")}>Sign in</button>
                  </div>
                )}

                {existingUserNotice && isSignupMode && (
                  <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">This email already has a Ximo account.</p>
                    <button type="button" onClick={() => switchAuthMode("signin")} className="mt-2 font-bold text-[#1A593B] hover:underline">Sign In to Continue</button>
                  </div>
                )}

                {verificationSent ? (
                  <div role="status" className="mt-8 rounded-3xl border border-[#C7DBCC] bg-white p-7 text-center shadow-[0_18px_50px_rgba(26,89,59,0.08)]">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#E5F1E8] text-2xl text-[#1A593B]">✓</span>
                    <h2 className="mt-5 text-xl font-semibold text-[#15251B]">Check your email</h2>
                    <p className="mt-2 text-sm leading-6 text-[#647168]">We sent a confirmation link to <span className="font-semibold text-[#15251B]">{formData.email}</span>.</p>
                    <button type="button" onClick={() => switchAuthMode("signin")} className="mt-6 min-h-12 w-full rounded-xl bg-[#1A593B] px-5 text-sm font-semibold text-white transition hover:bg-[#12472E]">I've verified my email — sign in</button>
                    {!planFromUrl && <Link to="/pricing" className="mt-4 inline-flex text-sm font-semibold text-[#1A593B] hover:underline">View plans</Link>}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {visibleError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">{visibleError}</div>}
                    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{notice}</div>}
                    {isSignupMode && <AccountField label="Full name" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Your name" autoComplete="name" icon="person" />}
                    <AccountField label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@company.com" autoComplete="email" icon="email" />
                    {!isResetMode && <AccountField label="Password" name="password" value={formData.password} onChange={handleChange} placeholder={isSignupMode ? "At least 6 characters" : "Enter your password"} autoComplete={isSignupMode ? "new-password" : "current-password"} icon="password" isPassword isVisible={isPasswordVisible} onToggleVisibility={() => setIsPasswordVisible((visible) => !visible)} minLength={6} action={isSignInMode ? <button type="button" onClick={showPasswordReset} className="text-xs font-semibold text-[#1A593B] hover:underline">Forgot password?</button> : null} />}
                    {isSignupMode && <AccountField label="Confirm password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password" icon="password" isPassword isVisible={isConfirmPasswordVisible} onToggleVisibility={() => setIsConfirmPasswordVisible((visible) => !visible)} minLength={6} />}
                    <button type="submit" disabled={isSubmitting} className="group mt-2 inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1A593B,#23734D)] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(26,89,59,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(26,89,59,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">{submitLabel}</button>
                    {isSignupMode && <p className="px-3 text-center text-xs leading-5 text-[#748078]">By creating an account, you agree to use Ximo responsibly and keep your sign-in details secure.</p>}
                  </form>
                )}

                {!verificationSent && isResetMode && <div className="mt-6 text-center"><button type="button" onClick={() => switchAuthMode("signin")} className="text-sm font-semibold text-[#1A593B] hover:underline">Back to sign in</button></div>}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <div className="mt-5 flex items-center justify-center gap-5 text-[11px] font-medium text-[#7A877E]"><span className="flex items-center gap-1.5"><span className="text-[#1A593B]">✓</span> Secure access</span><span className="h-3 w-px bg-[#C9D4CC]" /><span>Built for Ximo businesses</span></div>
        </div>
      </section>
    </main>
  );
}
