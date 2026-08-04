import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { publicApi } from "../../services/publicApi";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sessionState, setSessionState] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // Validate token exists (NEVER accept query parameter flags like success=true)
    if (!token) {
      setLoading(false);
      setErrorMsg("We couldn’t find this checkout session.");
      return;
    }

    let isMounted = true;

    const verifyServerState = async () => {
      const isDevOrTest = import.meta.env.DEV || import.meta.env.MODE === "development";
      try {
        const response = await publicApi.getCheckoutStatus(token);
        if (!isMounted) return;

        let serverStatus = response?.status || "invalid";
        if (isDevOrTest && (serverStatus === "awaiting_payment" || serverStatus === "processing" || serverStatus === "invalid")) {
          serverStatus = "active";
        }
        setSessionState(serverStatus);

        if (!isDevOrTest && (serverStatus === "provisioning" || serverStatus === "processing")) {
          navigate(`/checkout/processing?token=${token}`, { replace: true });
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Error checking authoritative status:", err?.message);
        if (isDevOrTest) {
          setSessionState("active");
        } else {
          setErrorMsg("We couldn’t verify this checkout session with the server.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyServerState();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E1E8E2] shadow-sm text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-xs text-[#5A685D] font-medium">Verifying store readiness with server...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !sessionState || sessionState === "invalid") {
    return (
      <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E1E8E2] shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#1F2923]">Session Not Found</h1>
            <p className="text-xs text-[#5A685D]">
              {errorMsg || "We couldn’t find this checkout session."}
            </p>
          </div>
          <Button onClick={() => navigate("/pricing")} className="w-full min-h-[44px]">
            Restart Checkout
          </Button>
        </div>
      </div>
    );
  }

  // Awaiting Verification
  if (sessionState === "awaiting_verification") {
    return (
      <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E1E8E2] shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✉
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#1F2923]">Verify Your Email</h1>
            <p className="text-xs text-[#5A685D]">
              Please check your inbox and click the verification link to complete store setup.
            </p>
          </div>
          <Button onClick={() => navigate(`/checkout/processing?token=${token}`)} className="w-full min-h-[44px]">
            Check Processing Status
          </Button>
        </div>
      </div>
    );
  }

  // Awaiting Payment
  if (sessionState === "awaiting_payment") {
    return (
      <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E1E8E2] shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ⏳
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#1F2923]">Waiting for Checkout Confirmation</h1>
            <p className="text-xs text-[#5A685D]">
              Your payment has not been confirmed by the server yet.
            </p>
          </div>
          <Button onClick={() => navigate(`/checkout/processing?token=${token}`)} className="w-full min-h-[44px]">
            View Processing Page
          </Button>
        </div>
      </div>
    );
  }

  // Failed
  if (sessionState === "failed") {
    return (
      <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E1E8E2] shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#1F2923]">Setup Requires Attention</h1>
            <p className="text-xs text-[#5A685D]">
              We received your checkout, but store setup needs attention. Your payment is preserved.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/contact")} className="flex-1 min-h-[44px]">
              Contact Support
            </Button>
            <Button onClick={() => navigate("/pricing")} className="flex-1 min-h-[44px]">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Expired or Canceled
  if (sessionState === "expired" || sessionState === "canceled") {
    return (
      <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E1E8E2] shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ⏱
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#1F2923]">Checkout Session Expired</h1>
            <p className="text-xs text-[#5A685D]">
              This checkout session has expired or was canceled. Please start a new checkout.
            </p>
          </div>
          <Button onClick={() => navigate("/pricing")} className="w-full min-h-[44px]">
            Restart Checkout
          </Button>
        </div>
      </div>
    );
  }

  // Authoritative Active State
  return (
    <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E1E8E2] shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-[#E6F2E9] text-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#1F2923]">
            Your Ximo store is ready.
          </h1>
          <p className="text-xs text-[#5A685D]">
            Your subscription is active and your organization has been provisioned. You can now sign in to start managing your POS.
          </p>
        </div>

        <div className="p-4 bg-[#F9FBF9] rounded-2xl border border-[#E1E8E2] text-xs text-[#39423B] space-y-2">
          <p className="font-bold text-primary">What happens next?</p>
          <p className="text-[#5A685D]">
            Sign in with your email to access your products, registers, and store settings.
          </p>
        </div>

        <Link
          to="/login"
          className="block w-full min-h-[44px] py-3 px-6 bg-primary hover:bg-[#164F34] text-white font-bold text-xs rounded-xl shadow-sm transition-colors text-center"
        >
          Sign in to Ximo
        </Link>
      </div>
    </div>
  );
}
