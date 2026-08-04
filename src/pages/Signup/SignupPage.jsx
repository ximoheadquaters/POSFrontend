import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../config/supabase";

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get("plan");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingUserNotice, setExistingUserNotice] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setExistingUserNotice(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setExistingUserNotice(false);

    // Basic Validation
    if (!formData.ownerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    setLoading(true);

    try {
      // Store checkout selection in sessionStorage if plan was provided
      if (planFromUrl) {
        sessionStorage.setItem("ximo_selected_plan", planFromUrl);
      }

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
        const msg = signUpError.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("email address")) {
          setExistingUserNotice(true);
        } else {
          setError(signUpError.message || "Unable to create account. Please try again.");
        }
        return;
      }

      // Check if user already exists (Supabase returns fake user with empty identities for security)
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        setExistingUserNotice(true);
        return;
      }

      // Successful signup — verification email sent
      setVerificationSent(true);
    } catch (err) {
      setError(err?.message || "An unexpected error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2923]">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-[#5A685D]">
            Start your Ximo POS subscription in minutes
          </p>
        </div>

        {/* Notice: Existing Account */}
        {existingUserNotice && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
            <p className="text-xs font-semibold text-amber-800">
              This email already has a Ximo account. Sign in to continue.
            </p>
            <button
              onClick={() => navigate(`/login${planFromUrl ? `?redirect=/checkout` : ""}`)}
              className="w-full min-h-[44px] py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        )}

        {/* Notice: Email Verification Sent */}
        {verificationSent ? (
          <div className="p-6 bg-[#E6F2E9] border border-[#B7CEBD] rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1F2923]">Check your email to verify your account.</h3>
              <p className="text-xs text-[#5A685D]">
                We sent a confirmation link to <span className="font-semibold text-[#1F2923]">{formData.email}</span>.
              </p>
            </div>
            <button
              onClick={() => navigate(`/checkout${planFromUrl ? `?plan=${planFromUrl}` : ""}`)}
              className="w-full min-h-[44px] py-2.5 px-4 bg-primary text-white font-bold text-xs rounded-xl hover:bg-[#164F34] transition-colors"
            >
              Continue to Checkout
            </button>
          </div>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#39423B]">
                Full Name / Owner Name
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="e.g. Maria Santos"
                required
                className="w-full min-h-[44px] px-3.5 py-2 bg-[#F9FBF9] border border-[#E1E8E2] rounded-xl text-xs text-[#1F2923] focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#39423B]">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="owner@yourstore.com"
                required
                className="w-full min-h-[44px] px-3.5 py-2 bg-[#F9FBF9] border border-[#E1E8E2] rounded-xl text-xs text-[#1F2923] focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#39423B]">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                className="w-full min-h-[44px] px-3.5 py-2 bg-[#F9FBF9] border border-[#E1E8E2] rounded-xl text-xs text-[#1F2923] focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#39423B]">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                className="w-full min-h-[44px] px-3.5 py-2 bg-[#F9FBF9] border border-[#E1E8E2] rounded-xl text-xs text-[#1F2923] focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] mt-2 py-3 px-4 bg-primary text-white font-bold text-xs rounded-xl hover:bg-[#164F34] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account & Continue"}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-[#5A685D]">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
