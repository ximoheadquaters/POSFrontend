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
      <div className="mb-2 flex items-center justify-between gap-3 lg:mb-1">
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-[#39443D] lg:text-[13px]"
        >
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#68736A]">
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
          className="w-full rounded-xl border border-[#C8D2C9] bg-white py-3 pl-11 pr-11 text-sm text-[#17241C] outline-none transition placeholder:text-[#9AA49C] focus:border-primary focus:ring-2 focus:ring-primary/15 lg:py-2.5 lg:text-[13px]"
        />
        {isPassword && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#68736A] transition hover:text-primary"
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
  const shouldExpandForSignupFeedback =
    isSignupMode && (existingUserNotice || Boolean(visibleError));
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
    <div className="min-h-screen bg-[#F5F4EE] px-4 py-5 sm:px-6 sm:py-8 lg:flex lg:items-center lg:px-8 lg:py-3">
      <div className="mx-auto w-full max-w-md lg:max-w-[1080px]">
        <div
          className={
            "overflow-hidden rounded-[28px] border border-[#D4DDD5] bg-[#FCFDF9] shadow-[0_24px_60px_rgba(23,36,28,0.12)] lg:grid " +
            (shouldExpandForSignupFeedback ? "lg:min-h-[684px]" : "lg:h-[684px]") +
            " lg:grid-cols-[0.96fr_1.04fr]"
          }
        >
          <section
            className={
              "relative px-6 pb-7 pt-[100px] sm:px-9 sm:pb-9 sm:pt-[104px] lg:min-h-0 lg:overflow-hidden lg:px-10 lg:pb-5 lg:pt-[88px] " +
              (isSignInMode || isResetMode
                ? "lg:flex lg:flex-col lg:justify-center"
                : "")
            }
          >
            <Link
              to="/"
              className="absolute left-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D4DDD5] bg-white text-[#17241C] shadow-sm transition hover:border-primary hover:text-primary sm:left-7 sm:top-7 lg:left-8 lg:top-8"
              aria-label="Back to home"
            >
              <BackArrowIcon />
            </Link>

            <motion.div
              layout="position"
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { layout: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } }
              }
              className="mx-auto max-w-[390px] lg:w-full"
            >
              <Link
                to="/"
                className="mb-8 inline-flex items-center gap-2.5 lg:hidden"
              >
                <img
                  src={XimoIconGreen}
                  alt=""
                  className="h-7 w-7 object-contain"
                />
                <span className="text-lg font-semibold tracking-[-0.05em] text-[#17241C]">
                  ximo
                </span>
              </Link>

              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={mode + (verificationSent ? "-verified" : "-form")}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                  }
                  className="w-full"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                    {headerCopy.eyebrow}
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#17241C] sm:text-4xl">
                    {headerCopy.title}
                  </h1>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#59645C] lg:mt-2 lg:leading-5">
                    <span className={headerCopy.compactBody ? "lg:hidden" : ""}>
                      {headerCopy.body}
                    </span>
                    {headerCopy.compactBody && (
                      <span className="hidden lg:inline">
                        {headerCopy.compactBody}
                      </span>
                    )}
                  </p>

                  {!isResetMode && (
                    <div
                      role="tablist"
                      aria-label="Account access"
                      className="mt-7 grid grid-cols-2 rounded-xl bg-[#E9EEEA] p-1 text-sm font-semibold lg:mt-4"
                    >
                      <button
                        type="button"
                        onClick={() => switchAuthMode("signup")}
                        role="tab"
                        aria-selected={isSignupMode}
                        className={
                          "flex min-h-[42px] items-center justify-center rounded-[9px] transition lg:min-h-[38px] " +
                          (isSignupMode
                            ? "bg-white text-[#17241C] shadow-sm"
                            : "text-[#68736A] hover:bg-white/65 hover:text-primary")
                        }
                      >
                        Create account
                      </button>
                      <button
                        type="button"
                        onClick={() => switchAuthMode("signin")}
                        role="tab"
                        aria-selected={isSignInMode}
                        className={
                          "flex min-h-[42px] items-center justify-center rounded-[9px] transition lg:min-h-[38px] " +
                          (isSignInMode
                            ? "bg-white text-[#17241C] shadow-sm"
                            : "text-[#68736A] hover:bg-white/65 hover:text-primary")
                        }
                      >
                        Sign in
                      </button>
                    </div>
                  )}

                  {existingUserNotice && isSignupMode && (
                    <div
                      role="alert"
                      className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                    >
                      <p className="font-semibold">
                        This email already has a Ximo account.
                      </p>
                      <p className="mt-1 text-amber-800">
                        Sign in to continue with this email.
                      </p>
                      <button
                        type="button"
                        onClick={() => switchAuthMode("signin")}
                        className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-amber-700 px-4 text-xs font-bold text-white transition hover:bg-amber-800"
                      >
                        Sign In to Continue
                      </button>
                    </div>
                  )}

                  {verificationSent ? (
                    <div
                      role="status"
                      className="mt-6 border border-[#B7CEBD] bg-[#E8F5EE] p-6 text-center"
                    >
                      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m3 8 7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
                          />
                        </svg>
                      </span>
                      <h2 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#17241C]">
                        Check your email to verify your account.
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#59645C]">
                        We sent a confirmation link to{" "}
                        <span className="font-semibold text-[#17241C]">
                          {formData.email}
                        </span>
                        . Confirm it, then sign in to continue.
                      </p>
                      <button
                        type="button"
                        onClick={() => switchAuthMode("signin")}
                        className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#164F34]"
                      >
                        I've verified my email - sign in
                      </button>
                      {!planFromUrl && (
                        <Link
                          to="/pricing"
                          className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                        >
                          View plans
                        </Link>
                      )}
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      className="mt-6 space-y-4 lg:mt-3 lg:space-y-2"
                    >
                      {visibleError && (
                        <div
                          role="alert"
                          className="border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
                        >
                          {visibleError}
                        </div>
                      )}
                      {notice && (
                        <div
                          role="status"
                          className="border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
                        >
                          {notice}
                        </div>
                      )}

                      {isSignupMode && (
                        <AccountField
                          label="Full name"
                          name="ownerName"
                          value={formData.ownerName}
                          onChange={handleChange}
                          placeholder="Your name"
                          autoComplete="name"
                          icon="person"
                        />
                      )}

                      <AccountField
                        label="Email address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        autoComplete="email"
                        icon="email"
                      />

                      {!isResetMode && (
                        <AccountField
                          label="Password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder={
                            isSignupMode
                              ? "At least 6 characters"
                              : "Enter your password"
                          }
                          autoComplete={
                            isSignupMode ? "new-password" : "current-password"
                          }
                          icon="password"
                          isPassword
                          isVisible={isPasswordVisible}
                          onToggleVisibility={() =>
                            setIsPasswordVisible((visible) => !visible)
                          }
                          minLength={6}
                          action={
                            isSignInMode ? (
                              <button
                                type="button"
                                onClick={showPasswordReset}
                                className="text-xs font-semibold text-primary hover:text-primary-700"
                              >
                                Forgot password?
                              </button>
                            ) : null
                          }
                        />
                      )}

                      {isSignupMode && (
                        <AccountField
                          label="Confirm password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat your password"
                          autoComplete="new-password"
                          icon="password"
                          isPassword
                          isVisible={isConfirmPasswordVisible}
                          onToggleVisibility={() =>
                            setIsConfirmPasswordVisible((visible) => !visible)
                          }
                          minLength={6}
                        />
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 inline-flex min-h-[50px] w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(26,89,59,0.18)] transition hover:-translate-y-0.5 hover:bg-[#164F34] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 lg:min-h-[46px]"
                      >
                        {submitLabel}
                      </button>

                      {isSignupMode && (
                        <p className="px-2 text-center text-xs leading-5 text-[#68736A] lg:leading-4">
                          <span className="lg:hidden">
                            By creating an account, you agree to use Ximo
                            responsibly and keep your sign-in details secure.
                          </span>
                          <span className="hidden lg:inline">
                            By creating an account, you agree to use Ximo
                            responsibly.
                          </span>
                        </p>
                      )}
                    </form>
                  )}

                  {!verificationSent && isResetMode && (
                    <div className="mt-6 text-center text-sm text-[#68736A] lg:mt-4">
                      <button
                        type="button"
                        onClick={() => switchAuthMode("signin")}
                        className="font-semibold text-primary hover:text-primary-700 hover:underline"
                      >
                        Back to sign in
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </section>

          <aside className="relative hidden min-h-full overflow-hidden bg-[#17241C] text-white lg:flex lg:flex-col lg:justify-between">
            <img
              src="/ximo-signup-pos.jpeg"
              alt="POS touchscreen in use at a counter"
              className="absolute inset-0 h-full w-full object-cover object-[65%_center] opacity-60"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#102017]/35 via-[#17241C]/58 to-[#102017]/95"
              aria-hidden="true"
            />

            <div className="relative flex items-center gap-2.5 p-10">
              <img
                src={XimoIconGreen}
                alt=""
                className="h-8 w-8 object-contain brightness-0 invert"
              />
              <span className="text-xl font-semibold tracking-[-0.05em]">
                ximo
              </span>
            </div>

            <div className="relative px-10 pb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#C9E4CF]">
                Built for the busy day
              </p>
              <h2 className="mt-4 max-w-md text-4xl font-semibold leading-[1.02] tracking-[-0.055em]">
                One clear place to keep business moving.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/76">
                Bring checkout, stock, and the next decision into a workspace
                designed around the work that matters.
              </p>

              <div className="mt-9 border border-white/20 bg-[#17241C]/75 p-5 backdrop-blur-sm">
                <p className="text-sm leading-6 text-white/90">
                  &ldquo;Ximo keeps the essential work close, so the next step
                  is always clear.&rdquo;
                </p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C9E4CF]">
                  Ximo business technology
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
