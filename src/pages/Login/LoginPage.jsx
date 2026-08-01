import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import XimoIconGreen from "../../assets/greenXimo.PNG";

const ADMIN_ROLES = new Set(["super_admin", "super-admin", "superadmin"]);

function Mark() {
  return <img src={XimoIconGreen} alt="Ximo" className="w-8" />;
}

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signOut, isAuthenticated, role, user, isLoading, error, clearError } = useAuth();
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
      const destination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : ADMIN_ROLES.has(String(auth.role).toLowerCase()) ? "/admin" : "/";
      navigate(destination, { replace: true });
    } catch {
      // The authentication error is rendered below.
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    setResetLoading(true);
    setNotice("");
    clearError();
    try {
      await authService.sendPasswordReset(email);
      setNotice("If an account exists for that email, a password reset link has been sent.");
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
    return <div className="grid min-h-screen place-items-center bg-[#F5F4EE] px-5"><div className="w-full max-w-md border border-[#D4DDD5] bg-white p-8 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#E7EEE7] font-semibold text-primary">!</div><h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#17241C]">Admin access required</h1><p className="mt-3 text-sm leading-6 text-[#59645C]">You are signed in as <strong>{user?.email || "an authenticated user"}</strong>, but this account does not have the required access.</p>{error && <div role="alert" className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}<Button className="mt-6 w-full" onClick={handleSwitchAccount} loading={isLoading}>Sign out and use another account</Button><Link to="/" className="mt-5 inline-block text-sm font-semibold text-primary">Return to website</Link></div></div>;
  }

  const isSubmitting = isLoading || resetLoading;
  return (
    <div className="min-h-screen bg-[#F5F4EE] lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="hidden flex-col justify-between bg-[#17241C] p-10 text-white lg:flex xl:p-14"><Link to="/" className="flex h-10 w-10 items-center justify-center overflow-hidden"><img src={XimoIconGreen} alt="Ximo" className="w-8 brightness-0 invert" /></Link><div><p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C9E4CF]">Ximo account</p><h1 className="mt-5 max-w-lg text-5xl font-semibold leading-[0.96] tracking-[-0.06em]">One place to run the work.</h1><p className="mt-6 max-w-md text-base leading-7 text-white/68">Access the Ximo tools that keep your operation moving, from the counter to the decisions behind it.</p></div><p className="text-sm text-white/48">Ximo business technology</p></aside>
      <main className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8"><div className="w-full max-w-md"><Link to="/" className="mb-12 flex items-center gap-3 lg:hidden"><span className="flex h-10 w-10 items-center justify-center overflow-hidden"><Mark /></span><span className="text-xl font-semibold tracking-[-0.04em] text-[#17241C]">ximo</span></Link><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{mode === "sign-in" ? "Secure sign in" : "Account recovery"}</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#17241C]">{mode === "sign-in" ? "Welcome back." : "Reset your password."}</h2><p className="mt-3 text-sm leading-6 text-[#59645C]">{mode === "sign-in" ? "Sign in to continue to your Ximo workspace." : "We will email a secure recovery link to your account."}</p><div className="mt-9 border border-[#D4DDD5] bg-white p-6 sm:p-8">{(error || notice) && <div role={error ? "alert" : "status"} className={`mb-5 border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || notice}</div>}<form className="space-y-5" onSubmit={mode === "sign-in" ? handleSignIn : handleReset}><div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#39443D]">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); if (error) clearError(); }} className="w-full border border-[#C8D2C9] px-4 py-3 text-[#17241C] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="you@company.com" /></div>{mode === "sign-in" && <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-semibold text-[#39443D]">Password</label><button type="button" className="text-xs font-semibold text-primary hover:text-primary-700" onClick={() => { clearError(); setNotice(""); setMode("reset"); }}>Forgot password?</button></div><input id="password" type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(event) => { setPassword(event.target.value); if (error) clearError(); }} className="w-full border border-[#C8D2C9] px-4 py-3 text-[#17241C] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Enter your password" /></div>}<Button type="submit" className="mt-2 w-full rounded-none" loading={isSubmitting} disabled={!email || (mode === "sign-in" && password.length < 6) || isSubmitting}>{mode === "sign-in" ? "Sign in" : "Send reset link"}</Button></form>{mode === "reset" && <button type="button" className="mt-5 w-full text-center text-sm font-semibold text-primary" onClick={() => { setMode("sign-in"); setNotice(""); }}>Back to sign in</button>}</div><p className="mt-7 text-sm text-[#68736A]"><Link to="/" className="font-semibold text-primary hover:text-primary-700">Back to home</Link></p></div></main>
    </div>
  );
}
