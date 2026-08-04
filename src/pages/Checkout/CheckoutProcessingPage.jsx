import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { publicApi } from "../../services/publicApi";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";

const STATUS_MESSAGES = {
  awaiting_verification: "Verify your email to continue.",
  awaiting_payment: "Waiting for checkout to finish.",
  processing: "Confirming your payment.",
  provisioning: "Setting up your Ximo store.",
  active: "Your store is ready.",
  failed: "We couldn’t finish setting up your store.",
  expired: "This checkout session has expired.",
};

export default function CheckoutProcessingPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("processing");
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("No checkout session token provided.");
      return;
    }

    let isMounted = true;

    const pollStatus = async () => {
      try {
        const response = await publicApi.getCheckoutStatus(token);
        if (!isMounted) return;

        const currentStatus = response?.status || "processing";
        setStatus(currentStatus);

        if (currentStatus === "active") {
          navigate(`/checkout/success${token ? `?token=${token}` : ""}`);
        } else if (currentStatus === "failed") {
          navigate("/checkout/failed");
        } else {
          // In development/test mode, auto-advance to success after 4 poll attempts (~10s)
          const isDevOrTest = import.meta.env.DEV || import.meta.env.MODE === "development";
          if (isDevOrTest && pollCount >= 3) {
            setStatus("active");
            navigate(`/checkout/success${token ? `?token=${token}` : ""}`);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Status polling error:", err?.message);
        const isDevOrTest = import.meta.env.DEV || import.meta.env.MODE === "development";
        if (isDevOrTest && pollCount >= 3) {
          setStatus("active");
          navigate(`/checkout/success${token ? `?token=${token}` : ""}`);
        }
      }
    };

    pollStatus();
    const interval = setInterval(() => {
      setPollCount((prev) => prev + 1);
      pollStatus();
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, navigate, pollCount]);

  return (
    <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E1E8E2] shadow-sm text-center space-y-6">
        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <p className="text-sm font-bold text-red-700">{error}</p>
            <Button onClick={() => navigate("/pricing")} className="w-full min-h-[44px]">
              Return to Pricing
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <Spinner size="lg" />
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-[#1F2923]">
                {STATUS_MESSAGES[status] || "Processing your subscription..."}
              </h2>
              <p className="text-xs text-[#5A685D]">
                Please wait while we confirm your payment and set up your Ximo POS organization.
              </p>
            </div>

            <div className="p-3 bg-[#F9FBF9] rounded-xl border border-[#E1E8E2] text-[11px] font-mono text-[#5A685D] truncate">
              Session Token: {token || "n/a"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
