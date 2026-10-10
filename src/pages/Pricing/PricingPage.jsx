import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../services/publicApi";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";

// Feature comparison categories in plain language
const FEATURE_CATEGORIES = [
  { id: "pos", name: "Point of Sale", desc: "Fast checkout, barcode scanning, receipt printing" },
  { id: "inventory", name: "Products and Inventory", desc: "Stock tracking, variants, category management" },
  { id: "purchasing", name: "Purchasing", desc: "Purchase orders and supplier records" },
  { id: "customers", name: "Customers", desc: "Customer profiles and purchase history" },
  { id: "reports", name: "Reports", desc: "Daily sales summaries and inventory movement" },
  { id: "promotions", name: "Promotions", desc: "Discounts and special pricing rules" },
  { id: "branches", name: "Branch Management", desc: "Multi-store support and central management" },
];

// Fallback plans if POS API dev instance is asleep/cold
const FALLBACK_PLANS = [
  {
    code: "starter",
    displayName: "Starter Plan",
    shortDescription: "The essentials to run a retail store.",
    monthlyPrice: "999.00",
    currency: "PHP",
    features: [
      "POS & checkout",
      "Product catalog and inventory",
      "Purchasing & restocking",
      "Returns & refunds",
      "Basic reports",
      "Unlimited users"
    ],
    recommended: false,
    availability: "available"
  },
  {
    code: "business",
    displayName: "Standard",
    shortDescription: "More control over products, promotions, inventory, and reporting.",
    monthlyPrice: "1999.00",
    currency: "PHP",
    features: [
      "Everything in Starter",
      "Categories, brands & variants",
      "Promotions & combos",
      "Stock transfers and repacking",
      "Dashboard and detailed reports",
      "Unlimited users"
    ],
    recommended: true,
    availability: "available"
  },
  {
    code: "professional",
    displayName: "Professional",
    shortDescription: "Advanced analysis, register control, and business management.",
    monthlyPrice: "3499.00",
    currency: "PHP",
    features: ["Everything in Standard", "Full reports and analytics", "Registers & shifts", "Cash reconciliation", "Expense management", "Unlimited users"],
    recommended: false,
    availability: "available"
  }
];

const fallbackPrice = (code) => Number(FALLBACK_PLANS.find((plan) => plan.code === code)?.monthlyPrice ?? 0);

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicApi.getPublicPlans();
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data);
      } else {
        // Fallback to static catalog if API returns empty
        setPlans(FALLBACK_PLANS);
      }
    } catch (err) {
      console.warn("Using fallback plans catalog due to API error:", err?.message);
      setPlans(FALLBACK_PLANS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSelectPlan = (planCode) => {
    navigate(`/checkout?plan=${planCode}&business=retail`);
  };

  return (
    <div className="bg-[#F8FAF8] min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-block px-3.5 py-1 text-xs font-bold tracking-wider text-primary uppercase bg-[#E6F2E9] rounded-full">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1F2923] tracking-tight">
            Choose the plan that fits your store today.
          </h1>
          <p className="text-base sm:text-lg text-[#5A685D]">
            You can upgrade later without losing your data.
          </p>
        </div>

        <p className="text-center text-sm text-[#5A685D]">Retail subscriptions include one store and unlimited users. Additional stores cost ₱500 each per month. Food-service pricing is quoted separately.</p>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-[#5A685D]">Loading official plan catalog...</p>
          </div>
        )}

        {/* Error / Empty State */}
        {!loading && error && (
          <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <Button variant="secondary" onClick={fetchPlans} className="min-h-[44px]">
              Try Again
            </Button>
          </div>
        )}

        {/* Plan Cards Grid */}
        {!loading && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isUnavailable = plan.availability === "hidden" || plan.availability === "disabled";
              return (
                <div
                  key={plan.code}
                  className={`relative flex flex-col justify-between p-6 sm:p-8 bg-white rounded-3xl border transition-all duration-200 ${
                    plan.recommended
                      ? "border-primary shadow-xl ring-2 ring-primary/20"
                      : "border-[#E1E8E2] shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Recommended Badge */}
                  {plan.recommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-sm">
                      Recommended
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#1F2923]">{plan.displayName}</h3>
                      <p className="text-xs text-[#5A685D] mt-1.5 min-h-[36px]">{plan.shortDescription}</p>
                    </div>

                    {/* Price Header */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#1F2923]">
                        ₱{(() => {
                          const priceNum = Number(plan?.monthlyPrice ?? plan?.monthly_price ?? plan?.price ?? fallbackPrice(plan?.code));
                          const validPrice = !isNaN(priceNum) && priceNum > 0 ? priceNum : fallbackPrice(plan?.code);
                          return validPrice.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        })()}
                      </span>
                      <span className="text-xs font-semibold text-[#5A685D]">/month</span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 border-t border-[#F0F4F1] pt-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#5A685D]">
                        Included Features:
                      </p>
                      <ul className="space-y-2.5">
                        {(() => {
                          const defaultFeatures = FALLBACK_PLANS.find((item) => item.code === plan.code)?.features || [];
                          const list = (Array.isArray(plan.features) && plan.features.length > 0)
                            ? plan.features
                            : defaultFeatures;

                          return list.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-[#39423B]">
                              <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feat}</span>
                            </li>
                          ));
                        })()}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-8 mt-6 border-t border-[#F0F4F1]">
                    <button
                      onClick={() => handleSelectPlan(plan.code)}
                      disabled={isUnavailable}
                      className={`w-full min-h-[44px] py-3 px-6 rounded-xl font-bold text-sm transition-all duration-150 ${
                        isUnavailable
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                          : plan.recommended
                          ? "bg-primary text-white hover:bg-[#164F34] shadow-sm active:scale-[0.99]"
                          : "bg-[#E6F2E9] text-primary hover:bg-[#D4E7D9] active:scale-[0.99]"
                      }`}
                    >
                      {isUnavailable ? "Unavailable" : "Get Started"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Comparison Matrix Section */}
        <div className="max-w-5xl mx-auto space-y-6 pt-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#1F2923]">Compare Feature Capabilities</h2>
            <p className="text-xs text-[#5A685D]">Capabilities vary by retail package. Choose a plan to review exactly what is included and which add-ons are available.</p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E1E8E2] shadow-sm overflow-hidden">
            <div className="divide-y divide-[#F0F4F1]">
              {FEATURE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FBF9] transition-colors">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#1F2923]">{cat.name}</h4>
                    <p className="text-xs text-[#5A685D]">{cat.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-xs font-semibold text-primary">See package details</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
