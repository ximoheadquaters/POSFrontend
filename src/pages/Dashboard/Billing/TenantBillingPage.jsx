import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../app/axios";
import { publicApi } from "../../../services/publicApi";
import {
  formatSubscriptionDate,
  getSubscriptionAccessState,
  formatSubscriptionCountdown
} from "../../../utils/subscriptionDateHelpers";
import Spinner from "../../../components/common/Spinner";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";

const STATUS_CONFIG = {
  trialing: {
    title: "Your trial is active.",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    desc: "Explore all features included in your trial."
  },
  active: {
    title: "Your subscription is active.",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    desc: "Your subscription renewal is up to date."
  },
  past_due: {
    title: "We couldn’t renew your subscription.",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    desc: "Your store remains active during the grace period. Please update billing."
  },
  suspended: {
    title: "Your subscription needs attention.",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    desc: "Your store data is safely preserved. Contact billing administrator to restore access."
  },
  canceled: {
    title: "Your subscription will end soon.",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    desc: "Access continues until your current billing period ends."
  },
  expired: {
    title: "Your subscription has ended.",
    badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
    desc: "Your store data remains preserved. Reactivate to resume operations."
  },
  provisioning_failed: {
    title: "Your payment was received, but your store setup still needs attention.",
    badgeClass: "bg-[#FFF4E5] text-[#B76E00] border-[#FFE0B2]",
    desc: "We received your checkout payment, but store setup is not complete."
  }
};

// Plain-language feature breakdown
const PLAN_CAPABILITIES = [
  { name: "Point of Sale Checkout", category: "POS", starter: true, business: true },
  { name: "Products & Inventory Management", category: "Inventory", starter: true, business: true },
  { name: "Customer Directory", category: "CRM", starter: true, business: true },
  { name: "Daily Sales Reports", category: "Reports", starter: true, business: true },
  { name: "Multi-Branch Operations", category: "Branches", starter: false, business: true },
  { name: "Food Service Ordering Tools", category: "Food Service", starter: false, business: true },
  { name: "Supplier Purchase Orders", category: "Purchasing", starter: false, business: true },
  { name: "Advanced Promotions & Discounts", category: "Promotions", starter: false, business: true },
];

export default function TenantBillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  // Modals
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTargetPlan, setSelectedTargetPlan] = useState("business");
  const [confirmCancelText, setConfirmCancelText] = useState("");
  const [actionMessage, setActionMessage] = useState(null);
  const [renewing, setRenewing] = useState(false);

  const handleRenewSubscription = async () => {
    if (renewing) return;
    setRenewing(true);
    setActionMessage(null);
    try {
      const res = await publicApi.renewSubscription();
      if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        throw new Error("No redirect URL returned.");
      }
    } catch (err) {
      setActionMessage({ type: "error", text: err?.response?.data?.error?.message || err?.message || "Failed to start renewal checkout." });
      setRenewing(false);
    }
  };

  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);
    setIsPermissionDenied(false);

    try {
      const response = await api.get("/billing/subscription");
      setSubscription(response.data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setIsPermissionDenied(true);
        setError("Only your organization’s billing administrator can manage the subscription.");
      } else {
        setError(err?.response?.data?.error?.message || "We couldn’t load billing details. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isDevOrTest = import.meta.env.DEV || import.meta.env.MODE === "development" || import.meta.env.MODE === "test" || !import.meta.env.PROD;

  const statusInfo = STATUS_CONFIG[subscription?.status] || STATUS_CONFIG.active;
  const isDowngrade = subscription?.plan?.code === "business" && selectedTargetPlan === "starter";

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E8E2] pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2923]">Plan & Billing</h1>
          <p className="text-xs text-[#5A685D] mt-1">
            Manage your Ximo store subscription, view plan features, and check renewal details.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Back to Store Dashboard
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-white rounded-3xl border border-[#E1E8E2]">
          <Spinner size="lg" />
          <p className="text-xs font-medium text-[#5A685D]">Loading your subscription…</p>
        </div>
      )}

      {/* Permission Denied State */}
      {!loading && isPermissionDenied && (
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            🔒
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-amber-900">Access Restricted</h3>
            <p className="text-xs text-amber-800">
              Only your organization’s billing administrator can manage the subscription.
            </p>
          </div>
          <p className="text-[11px] text-amber-700">
            Contact your store owner to request billing administrative access.
          </p>
        </div>
      )}

      {/* General Error State */}
      {!loading && !isPermissionDenied && error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <p className="text-xs font-medium text-red-700">{error}</p>
          <Button onClick={fetchSubscription} className="min-h-[44px]">
            Try Again
          </Button>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && subscription && (() => {
        const accessState = getSubscriptionAccessState(subscription);
        const canRenew = subscription.availableActions?.some(a => a.code === "renew");

        return (
          <div className="space-y-8">
            {/* Environment Action Banner */}
            {actionMessage && (
              <div className={`p-4 rounded-2xl border text-xs font-medium ${
                actionMessage.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                {actionMessage.text}
              </div>
            )}

            {/* Status Presentation Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${statusInfo.badgeClass}`}>
                    {subscription.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <h2 className="text-xl font-extrabold text-[#1F2923] mt-2">{statusInfo.title}</h2>
                  <p className="text-xs text-[#5A685D]">{statusInfo.desc}</p>
                </div>

                {/* Renewal Details */}
                <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F0F4F1]">
                  <p className="text-xs text-[#5A685D]">Next Renewal / Period End</p>
                  <p className="text-sm font-bold text-[#1F2923]">
                    {accessState.formattedPeriodEnd || "Date Unavailable"}
                  </p>
                  {accessState.formattedGraceEnd && (
                    <p className="text-xs font-bold text-amber-700">
                      Grace period ends: {accessState.formattedGraceEnd}
                    </p>
                  )}
                </div>
              </div>

              {/* Paid Provisioning Failure Action */}
              {subscription.status === "provisioning_failed" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-amber-900">
                    Your payment was received, but store setup is not complete.
                  </p>
                  <p className="text-xs text-amber-800">
                    You do not need to pay again. Re-trigger setup or contact support.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setActionMessage({ type: "success", text: "Store setup retry initiated." })}
                      className="min-h-[44px]"
                    >
                      Retry Setup
                    </Button>
                    <Link to="/contact" className="inline-flex min-h-[44px] items-center justify-center px-4 py-2 bg-white border border-amber-300 text-amber-900 font-bold text-xs rounded-xl hover:bg-amber-100">
                      Contact Support
                    </Link>
                  </div>
                </div>
              )}

              {/* Safe Fallback Banner for Missing / Invalid End Date */}
              {!accessState.isSafe && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900">
                  {accessState.fallbackMessage}
                </div>
              )}

              {/* Renewal Storyboard Action Section */}
              {canRenew && accessState.isSafe && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                  {accessState.state === "grace" && (
                    <>
                      <h4 className="text-xs font-bold text-amber-900">
                        Grace period active — {accessState.countdownText || "0 days remaining"}.
                      </h4>
                      <p className="text-xs text-amber-800">
                        Your store remains fully available during the grace period.
                      </p>
                      <Button onClick={handleRenewSubscription} disabled={renewing} className="min-h-[44px]">
                        {renewing ? "Starting Renewal..." : "Renew Now to Avoid Interruption"}
                      </Button>
                    </>
                  )}

                  {accessState.state === "suspended" && (
                    <>
                      <h4 className="text-xs font-bold text-red-900">Your subscription has ended.</h4>
                      <p className="text-xs text-red-800">Your data is safe. Renew to restore store access.</p>
                      <Button onClick={handleRenewSubscription} disabled={renewing} className="min-h-[44px]">
                        {renewing ? "Starting Renewal..." : "Renew to Restore Store Access"}
                      </Button>
                    </>
                  )}

                  {accessState.state === "active" && accessState.daysRemaining !== null && accessState.daysRemaining <= 7 && (
                    <>
                      <h4 className="text-xs font-bold text-blue-900">
                        Your subscription ends in {accessState.countdownText}.
                      </h4>
                      <p className="text-xs text-blue-800">
                        This is a one-time renewal payment. Automatic renewal is not enabled.
                      </p>
                      <Button onClick={handleRenewSubscription} disabled={renewing} className="min-h-[44px]">
                        {renewing ? "Starting Renewal..." : "Renew Now"}
                      </Button>
                    </>
                  )}

                  {accessState.state === "active" && (accessState.daysRemaining === null || accessState.daysRemaining > 7) && (
                    <>
                      <h4 className="text-xs font-bold text-blue-900">
                        Your plan is paid through {accessState.formattedPeriodEnd}.
                      </h4>
                      <p className="text-xs text-blue-800">
                        This is a one-time renewal payment. Automatic renewal is not enabled.
                      </p>
                      <Button onClick={handleRenewSubscription} disabled={renewing} className="min-h-[44px]">
                        {renewing ? "Starting Renewal..." : "Renew for Another Month"}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Current Plan Summary & Feature Matrix */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0F4F1] pb-6">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Current Plan</span>
                  <h3 className="text-2xl font-black text-[#1F2923] mt-1">{subscription.plan.displayName}</h3>
                  <p className="text-xs text-[#5A685D] mt-1">{subscription.plan.shortDescription}</p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-3xl font-black text-[#1F2923]">
                    ₱{Number(subscription.plan.monthlyPrice).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-[#5A685D] block">/month</span>
                </div>
              </div>

              {/* Feature Access Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#5A685D] uppercase tracking-wider">
                  Feature Capabilities Breakdown
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PLAN_CAPABILITIES.map((cap, idx) => {
                    const isIncludedInPlan = subscription.plan.code === "business" ? cap.business : cap.starter;
                    return (
                      <div key={idx} className="p-3.5 bg-[#F9FBF9] rounded-2xl border border-[#E1E8E2] flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1F2923]">{cap.name}</span>
                        {isIncludedInPlan ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                            ✓ Included
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full">
                            Upgrade required
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plan Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#F0F4F1]">
                <Button onClick={() => setShowChangePlanModal(true)} className="min-h-[44px]">
                  Change Plan
                </Button>
                <Button variant="secondary" onClick={() => setShowCancelModal(true)} className="min-h-[44px]">
                  Cancel Subscription
                </Button>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#1F2923] uppercase tracking-wider">Payment Method</h3>
              <div className="p-4 bg-[#F9FBF9] rounded-2xl border border-[#E1E8E2] text-xs text-[#5A685D]">
                {subscription.paymentMethodSummary || "Payment method details are not available yet."}
              </div>
            </div>

            {/* Invoice History Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1E8E2] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#1F2923] uppercase tracking-wider">Billing & Invoice History</h3>
              <div className="p-8 text-center bg-[#F9FBF9] rounded-2xl border border-[#E1E8E2] text-xs text-[#5A685D]">
                No invoices are available yet.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Change Plan Storyboard Modal */}
      <Modal
        isOpen={showChangePlanModal}
        onClose={() => setShowChangePlanModal(false)}
        title="Change Subscription Plan"
      >
        <div className="space-y-6 text-xs text-[#39423B]">
          <div>
            <p className="font-bold text-[#1F2923] mb-2">Select Target Plan:</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: "starter", name: "Starter Plan", price: "₱499.00/mo" },
                { code: "business", name: "Business Plan", price: "₱999.00/mo" }
              ].map((p) => (
                <button
                  key={p.code}
                  onClick={() => setSelectedTargetPlan(p.code)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    selectedTargetPlan === p.code
                      ? "border-primary bg-[#E6F2E9] font-bold text-primary"
                      : "border-[#E1E8E2] bg-white text-[#4B574E]"
                  }`}
                >
                  <p className="font-bold">{p.name}</p>
                  <p className="text-[11px] mt-0.5">{p.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Downgrade Warning Requirement */}
          {isDowngrade && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <p className="font-bold text-amber-900">Downgrade Notice:</p>
              <p className="text-amber-800">
                Your data will not be deleted. Features outside the new plan will become unavailable at the end of your current billing period.
              </p>
            </div>
          )}

          {/* Environment Banner */}
          {isDevOrTest ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
              Test billing action — no real payment will be processed.
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
              Online billing management is not available yet. Contact Ximo support.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E8E2]">
            <Button variant="ghost" onClick={() => setShowChangePlanModal(false)}>
              Close
            </Button>
            {isDevOrTest ? (
              <Button
                onClick={() => {
                  setShowChangePlanModal(false);
                  setActionMessage({ type: "success", text: `Test plan change requested to ${selectedTargetPlan}.` });
                }}
              >
                Start Test Change Plan
              </Button>
            ) : (
              <Link to="/contact" className="inline-flex min-h-[44px] items-center justify-center px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs">
                Contact Sales
              </Link>
            )}
          </div>
        </div>
      </Modal>

      {/* Cancellation Storyboard Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
      >
        <div className="space-y-6 text-xs text-[#39423B]">
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2">
            <p className="font-bold text-red-900">Are you sure you want to cancel?</p>
            {subscription?.currentPeriodEnd && !isNaN(new Date(subscription.currentPeriodEnd).getTime()) ? (
              <p className="text-red-800">
                You’ll keep access until{" "}
                <strong>
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-PH", {
                    timeZone: "Asia/Manila",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </strong>
                . Your store data will be preserved.
              </p>
            ) : (
              <p className="text-red-800 font-bold">
                We couldn’t determine your paid-through date. Contact Ximo support before canceling.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#1F2923]">
              Type "CANCEL" to confirm:
            </label>
            <input
              type="text"
              value={confirmCancelText}
              onChange={(e) => setConfirmCancelText(e.target.value)}
              placeholder="CANCEL"
              className="w-full min-h-[44px] px-3.5 py-2 bg-[#F9FBF9] border border-[#E1E8E2] rounded-xl text-xs"
            />
          </div>

          {/* Environment Banner */}
          {isDevOrTest ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
              Test billing action — no real payment will be cancelled.
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
              Online billing management is not available yet. Contact Ximo support.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E8E2]">
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
              Keep Subscription
            </Button>
            {isDevOrTest ? (
              <Button
                variant="danger"
                disabled={confirmCancelText !== "CANCEL" || !subscription?.currentPeriodEnd || isNaN(new Date(subscription.currentPeriodEnd).getTime())}
                onClick={() => {
                  setShowCancelModal(false);
                  setActionMessage({ type: "success", text: "Test cancellation request recorded. Store access remains until period end." });
                }}
              >
                Confirm Test Cancellation
              </Button>
            ) : (
              <Link to="/contact" className="inline-flex min-h-[44px] items-center justify-center px-4 py-2 bg-[#4B574E] text-white font-bold rounded-xl text-xs">
                Contact Support
              </Link>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
