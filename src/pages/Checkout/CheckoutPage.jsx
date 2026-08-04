import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { publicApi } from "../../services/publicApi";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";

const STEPS = [
  { id: 1, title: "Your Plan" },
  { id: 2, title: "Your Account" },
  { id: 3, title: "Your Business" },
  { id: 4, title: "Payment" },
  { id: 5, title: "Review" },
];

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const planCodeFromUrl = searchParams.get("plan");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planError, setPlanError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Business form state
  const [businessData, setBusinessData] = useState({
    organizationName: "",
    intendedBusinessProfile: "retail", // 'retail', 'food_service', 'retail_and_food_service'
    timezone: "Asia/Manila",
    currency: "PHP",
  });

  // Load selected plan from API (Never trust URL price!)
  useEffect(() => {
    const fetchPlanDetails = async () => {
      setLoadingPlan(true);
      setPlanError(null);

      // Determine plan code from URL or sessionStorage
      const code = planCodeFromUrl || sessionStorage.getItem("ximo_selected_plan") || "starter";
      sessionStorage.setItem("ximo_selected_plan", code);

      try {
        const plans = await publicApi.getPublicPlans();
        const found = plans?.find((p) => p.code === code);

        if (found) {
          setSelectedPlan(found);
        } else {
          // Fallback if specific plan code not found
          setSelectedPlan(plans?.[0] || {
            code: "starter",
            displayName: "Starter Plan",
            monthlyPrice: "499.00",
            currency: "PHP",
            features: ["Fast POS Checkout", "Inventory Management", "Customer Directory"]
          });
        }
      } catch (err) {
        console.warn("Error fetching plan details, using fallback:", err?.message);
        setSelectedPlan({
          code: code,
          displayName: code === "business" ? "Business Plan" : "Starter Plan",
          monthlyPrice: code === "business" ? "999.00" : "499.00",
          currency: "PHP",
          features: ["POS Checkout", "Inventory Management", "Sales Reports"]
        });
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlanDetails();
  }, [planCodeFromUrl]);

  // Load saved business data from sessionStorage if exists
  useEffect(() => {
    const saved = sessionStorage.getItem("ximo_business_data");
    if (saved) {
      try {
        setBusinessData((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const updateBusinessField = (field, val) => {
    setBusinessData((prev) => {
      const next = { ...prev, [field]: val };
      sessionStorage.setItem("ximo_business_data", JSON.stringify(next));
      return next;
    });
  };

  const isEmailVerified = Boolean(user?.email_confirmed_at || user?.confirmed_at || user?.id);

  const handleNextStep = () => {
    setErrorMsg(null);
    if (currentStep === 3 && !businessData.organizationName.trim()) {
      setErrorMsg("Please enter an organization name.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStartCheckout = async () => {
    if (submitting) return;

    if (!isAuthenticated || !user?.email) {
      setErrorMsg("Please sign in or create an account first.");
      setCurrentStep(2);
      return;
    }

    if (!businessData.organizationName.trim()) {
      setErrorMsg("Please enter your business organization name.");
      setCurrentStep(3);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        planCode: selectedPlan.code,
        billingInterval: "monthly",
        ownerEmail: user.email,
        organizationName: businessData.organizationName.trim(),
        intendedBusinessProfile: businessData.intendedBusinessProfile,
        currency: "PHP",
      };

      const result = await publicApi.createCheckoutSession(payload);

      if (result?.checkoutSessionToken) {
        // Clear transient form state
        sessionStorage.removeItem("ximo_business_data");
        navigate(`/checkout/processing?token=${result.checkoutSessionToken}`);
      } else if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error("No session token returned from server.");
      }
    } catch (err) {
      console.error("Checkout creation error:", err);
      setErrorMsg(err?.response?.data?.error?.message || "Checkout session creation failed. Try again.");
      setSubmitting(false);
    }
  };

  const isDevOrTest = import.meta.env.DEV || import.meta.env.MODE === "development" || import.meta.env.MODE === "test" || !import.meta.env.PROD;

  return (
    <div className="bg-[#F8FAF8] min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Stepper Header */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1F2923]">Store Setup & Subscription</h1>
            <span className="text-xs font-semibold text-primary bg-[#E6F2E9] px-3 py-1 rounded-full">
              Step {currentStep} of 5
            </span>
          </div>

          {/* Step Badges */}
          <div className="grid grid-cols-5 gap-1.5 pt-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-2 rounded-full transition-colors ${
                  step.id <= currentStep ? "bg-primary" : "bg-[#E1E8E2]"
                }`}
                title={step.title}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-[#5A685D] px-1">
            {STEPS.map((step) => (
              <span
                key={step.id}
                className={step.id === currentStep ? "text-primary font-bold" : ""}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Your Plan */}
        {currentStep === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1F2923]">Selected Subscription Plan</h2>
                <p className="text-xs text-[#5A685D]">Official price resolved directly from Ximo server</p>
              </div>
              <Link to="/pricing" className="text-xs font-bold text-primary hover:underline">
                Change Plan
              </Link>
            </div>

            {loadingPlan ? (
              <div className="py-12 flex justify-center">
                <Spinner size="md" />
              </div>
            ) : (
              <div className="p-6 bg-[#F9FBF9] rounded-2xl border border-[#E1E8E2] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-[#1F2923]">{selectedPlan?.displayName}</h3>
                    <p className="text-xs text-[#5A685D] mt-1">{selectedPlan?.shortDescription}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#1F2923]">
                      ₱{Number(selectedPlan?.monthlyPrice || 499).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-[#5A685D] block">/month (PHP)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E1E8E2]/60 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5A685D]">Included Features:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#39423B]">
                    {selectedPlan?.features?.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <Button onClick={handleNextStep} className="w-full min-h-[44px]">
              Continue to Account Setup
            </Button>
          </div>
        )}

        {/* STEP 2: Your Account */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1F2923]">Account Ownership</h2>
              <p className="text-xs text-[#5A685D]">Who will own and manage this Ximo store subscription?</p>
            </div>

            {!isAuthenticated ? (
              <div className="p-6 bg-[#F9FBF9] rounded-2xl border border-[#E1E8E2] text-center space-y-4">
                <p className="text-xs text-[#5A685D]">You must be signed in to set up a subscription.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={`/signup?plan=${selectedPlan?.code}`} className="flex-1 min-h-[44px] flex items-center justify-center py-2.5 px-4 bg-primary text-white font-bold text-xs rounded-xl hover:bg-[#164F34] transition-colors">
                    Create New Account
                  </Link>
                  <Link to={`/login?redirect=/checkout`} className="flex-1 min-h-[44px] flex items-center justify-center py-2.5 px-4 bg-white border border-[#E1E8E2] text-primary font-bold text-xs rounded-xl hover:bg-[#F0F4F1] transition-colors">
                    Sign In to Existing Account
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#E6F2E9] border border-[#B7CEBD] rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs text-[#5A685D]">Signed in as owner:</p>
                    <p className="text-sm font-bold text-[#1F2923]">{user?.email}</p>
                  </div>
                </div>

                {!isEmailVerified && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                    Email verification is required before provisioning. Please verify your email via the link sent to your inbox.
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handlePrevStep} className="min-h-[44px]">Back</Button>
              <Button onClick={handleNextStep} disabled={!isAuthenticated} className="flex-1 min-h-[44px]">
                Continue to Business Setup
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Your Business */}
        {currentStep === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1F2923]">Business Information</h2>
              <p className="text-xs text-[#5A685D]">Your business details for Ximo store organization</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#39423B]">
                  Organization / Business Name *
                </label>
                <input
                  type="text"
                  value={businessData.organizationName}
                  onChange={(e) => updateBusinessField("organizationName", e.target.value)}
                  placeholder="e.g. Metro Retail Supermarket"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#F9FBF9] border border-[#E1E8E2] rounded-xl text-xs text-[#1F2923] focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#39423B]">
                  Intended Business Type *
                </label>
                <select
                  value={businessData.intendedBusinessProfile}
                  onChange={(e) => updateBusinessField("intendedBusinessProfile", e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#F9FBF9] border border-[#E1E8E2] rounded-xl text-xs text-[#1F2923] focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="retail">Pure Retail (Supermarket, Boutique, Convenience)</option>
                  <option value="food_service">Food Service (Restaurant, Cafe, Fast Food)</option>
                  <option value="hybrid">Hybrid (Retail + Food Service)</option>
                </select>
                <p className="text-[11px] text-[#5A685D] mt-1">
                  Your business type helps Ximo organize the tools and language you see. Business type changes are managed by Ximo support.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#39423B]">Currency</label>
                  <input
                    type="text"
                    value="PHP (Philippine Peso)"
                    disabled
                    className="w-full min-h-[44px] px-3.5 py-2 bg-gray-100 border border-[#E1E8E2] rounded-xl text-xs text-gray-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#39423B]">Timezone</label>
                  <input
                    type="text"
                    value="Asia/Manila (PHT)"
                    disabled
                    className="w-full min-h-[44px] px-3.5 py-2 bg-gray-100 border border-[#E1E8E2] rounded-xl text-xs text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handlePrevStep} className="min-h-[44px]">Back</Button>
              <Button onClick={handleNextStep} className="flex-1 min-h-[44px]">
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Payment Environment */}
        {currentStep === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1F2923]">Payment Activation</h2>
              <p className="text-xs text-[#5A685D]">Verification of payment environment status</p>
            </div>

            {isDevOrTest ? (
              /* Test Environment Banner */
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Development / Test Environment Active
                </div>
                <p className="text-xs text-blue-900 font-medium">
                  Test checkout — no real payment will be charged.
                </p>
                <p className="text-[11px] text-blue-700">
                  This test checkout simulates complete subscription payment confirmation and triggers idempotent organization provisioning.
                </p>
              </div>
            ) : (
              /* Production Environment Notice (Disabled) */
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                <div className="font-bold text-xs text-amber-800 uppercase tracking-wider">
                  Online Payment System
                </div>
                <p className="text-sm font-bold text-amber-900">
                  Online subscription checkout is not available yet.
                </p>
                <p className="text-xs text-amber-700">
                  Please contact Ximo sales to complete registration for live production stores.
                </p>
                <div className="pt-2">
                  <Link to="/contact" className="inline-flex min-h-[44px] items-center justify-center px-4 py-2 bg-amber-700 text-white font-bold text-xs rounded-xl hover:bg-amber-800 transition-colors">
                    Contact Sales
                  </Link>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handlePrevStep} className="min-h-[44px]">Back</Button>
              <Button onClick={handleNextStep} disabled={!isDevOrTest} className="flex-1 min-h-[44px]">
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review */}
        {currentStep === 5 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1F2923]">Review & Confirm Subscription</h2>
              <p className="text-xs text-[#5A685D]">Please confirm your details before starting checkout session</p>
            </div>

            <div className="divide-y divide-[#F0F4F1] border border-[#E1E8E2] rounded-2xl overflow-hidden text-xs">
              <div className="p-4 flex justify-between bg-[#F9FBF9]">
                <span className="text-[#5A685D]">Selected Plan:</span>
                <span className="font-bold text-[#1F2923]">{selectedPlan?.displayName}</span>
              </div>
              <div className="p-4 flex justify-between">
                <span className="text-[#5A685D]">Monthly Price:</span>
                <span className="font-bold text-[#1F2923]">
                  ₱{Number(selectedPlan?.monthlyPrice || 499).toLocaleString("en-PH", { minimumFractionDigits: 2 })} / month
                </span>
              </div>
              <div className="p-4 flex justify-between bg-[#F9FBF9]">
                <span className="text-[#5A685D]">Owner Account:</span>
                <span className="font-bold text-[#1F2923]">{user?.email}</span>
              </div>
              <div className="p-4 flex justify-between">
                <span className="text-[#5A685D]">Organization Name:</span>
                <span className="font-bold text-[#1F2923]">{businessData.organizationName}</span>
              </div>
              <div className="p-4 flex justify-between bg-[#F9FBF9]">
                <span className="text-[#5A685D]">Business Profile:</span>
                <span className="font-bold text-[#1F2923] capitalize">
                  {businessData.intendedBusinessProfile.replace(/_/g, " ")}
                </span>
              </div>
              <div className="p-4 flex justify-between">
                <span className="text-[#5A685D]">Payment Mode:</span>
                <span className="font-bold text-blue-700">PayMongo Sandbox (Test Mode)</span>
              </div>
            </div>

            {/* Sandbox Notice Banner */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-semibold text-blue-900">
              PayMongo test checkout — no real payment will be charged.
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handlePrevStep} className="min-h-[44px]">Back</Button>
              <button
                onClick={handleStartCheckout}
                disabled={submitting || !isDevOrTest}
                className="flex-1 min-h-[44px] py-3 px-6 bg-primary hover:bg-[#164F34] text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {submitting ? "Starting Test Checkout..." : "Continue to PayMongo Test Checkout"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
