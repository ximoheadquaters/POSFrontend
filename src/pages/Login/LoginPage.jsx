import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";
import { authService } from "../../services/authService";

const ADMIN_ROLES = new Set(["super_admin", "super-admin", "superadmin"]);

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    signIn,
    signOut,
    isAuthenticated,
    role,
    user,
    isLoading,
    error,
    clearError,
  } = useAuth();
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => () => clearError(), [clearError]);

  async function handleSignIn(event) {
    event.preventDefault();
    setNotice("");
    try {
      const auth = await signIn(email, password);
      const requestedPath = location.state?.from?.pathname;
      const destination =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : ADMIN_ROLES.has(String(auth.role).toLowerCase())
            ? "/admin"
            : "/";
      navigate(destination, { replace: true });
    } catch {
      // The Redux error is rendered below.
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    setResetLoading(true);
    setNotice("");
    clearError();
    try {
      await authService.sendPasswordReset(email);
      setNotice(
        "If an account exists for that email, a password reset link has been sent.",
      );
    } catch (resetError) {
      setNotice(resetError.message);
    } finally {
      setResetLoading(false);
    }
  }

  async function handleSwitchAccount() {
    clearError();
    setNotice("");
    await signOut();
    setPassword("");
  }

  const hasAdminAccess = ADMIN_ROLES.has(String(role || "").toLowerCase());

  if (isAuthenticated && !hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md rounded-card border border-amber-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-xl text-amber-700">
            !
          </div>
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">
            Super Admin access required
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            You are signed in as{" "}
            <strong>{user?.email || "an authenticated user"}</strong>, but this
            session does not contain the <code>super_admin</code> role.
          </p>
          <p className="mt-3 text-xs text-neutral-500">
            Current role: {role || "none"}
          </p>
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-button border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}
          <Button
            className="mt-6 w-full"
            onClick={handleSwitchAccount}
            loading={isLoading}
          >
            Sign out and use another account
          </Button>
          <Link
            to="/"
            className="mt-4 inline-block text-sm font-medium text-primary"
          >
            Return to website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-lg font-bold text-white">X</span>
            </div>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {mode === "sign-in" ? "Welcome back" : "Reset your password"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {mode === "sign-in"
              ? "Sign in to your Ximo account"
              : "We’ll email you a secure recovery link"}
          </p>
        </div>
        <div className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
          {(error || notice) && (
            <div
              role={error ? "alert" : "status"}
              className={`mb-4 rounded-button border p-3 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {error || notice}
            </div>
          )}
          <form
            className="space-y-4"
            onSubmit={mode === "sign-in" ? handleSignIn : handleReset}
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) clearError();
                }}
                className="w-full rounded-button border border-neutral-300 px-3 py-2.5 text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@company.com"
              />
            </div>
            {mode === "sign-in" && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:text-primary-700"
                    onClick={() => {
                      clearError();
                      setNotice("");
                      setMode("reset");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) clearError();
                  }}
                  className="w-full rounded-button border border-neutral-300 px-3 py-2.5 text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your password"
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              loading={isLoading || resetLoading}
              disabled={
                !email ||
                (mode === "sign-in" && password.length < 6) ||
                isLoading ||
                resetLoading
              }
            >
              {mode === "sign-in" ? "Sign in" : "Send reset link"}
            </Button>
          </form>
          {mode === "reset" && (
            <button
              type="button"
              className="mt-4 w-full text-center text-sm font-medium text-primary"
              onClick={() => {
                setMode("sign-in");
                setNotice("");
              }}
            >
              Back to sign in
            </button>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-neutral-400">
          <Link
            to="/"
            className="text-primary hover:text-primary-600 transition-colors"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
