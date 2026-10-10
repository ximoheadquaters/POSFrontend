import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../app/axios";
import { publicApi } from "../../../services/publicApi";
import { getSubscriptionAccessState } from "../../../utils/subscriptionDateHelpers";
import Spinner from "../../../components/common/Spinner";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import { PageHeader, StatusBadge } from "../../../components/pos/PosUi";

const STATUS_CONFIG = {
  trialing: {
    title: "Your trial is active.",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    desc: "All trial features are available.",
  },
  active: {
    title: "Your subscription is active.",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    desc: "Your subscription renewal is up to date.",
  },
  past_due: {
    title: "We couldn’t renew your subscription.",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    desc: "Your store remains active during the grace period. Please update billing.",
  },
  suspended: {
    title: "Your subscription needs attention.",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    desc: "Your store data is safely preserved. Contact billing administrator to restore access.",
  },
  canceled: {
    title: "Your subscription will end soon.",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    desc: "Access continues until your current billing period ends.",
  },
  expired: {
    title: "Your subscription has ended.",
    badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
    desc: "Your store data remains preserved. Reactivate to resume operations.",
  },
  provisioning_failed: {
    title:
      "Your payment was received, but your store setup still needs attention.",
    badgeClass: "bg-[#FFF4E5] text-[#B76E00] border-[#FFE0B2]",
    desc: "We received your checkout payment, but store setup is not complete.",
  },
};

export default function TenantBillingPage() {
  const [subscription, setSubscription] = useState(() => {
    try {
      const cached = sessionStorage.getItem("ximo_billing_subscription");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!subscription);
  const [error, setError] = useState(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  // Modals
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTargetPlan, setSelectedTargetPlan] = useState("business");
  const [confirmCancelText, setConfirmCancelText] = useState("");
  const [actionMessage, setActionMessage] = useState(null);
  const [renewing, setRenewing] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const hasLoadedInitialSubscription = useRef(false);

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
      setActionMessage({
        type: "error",
        text:
          err?.response?.data?.error?.message ||
          err?.message ||
          "Failed to start renewal checkout.",
      });
      setRenewing(false);
    }
  };

  const handleChangePlan = async (withPayment = true) => {
    if (changingPlan) return;
    setChangingPlan(true);
    setActionMessage(null);
    try {
      const res = await api.post("/billing/change-plan", {
        planCode: selectedTargetPlan,
        pay: withPayment,
      });
      if (res.data?.requiresPayment && res.data?.redirectUrl) {
        setActionMessage({
          type: "success",
          text: "Connecting to PayMongo QR Ph checkout...",
        });
        window.location.href = res.data.redirectUrl;
        return;
      }
      setShowChangePlanModal(false);
      setActionMessage({
        type: "success",
        text:
          res.data?.message ||
            `Plan successfully updated to ${selectedTargetPlan === "business" ? "Standard" : "Starter"} Plan!`,
      });
      try {
        sessionStorage.removeItem("ximo_billing_subscription");
        sessionStorage.removeItem("ximo_client_workspace");
      } catch {}
      await fetchSubscription(false);
    } catch (err) {
      setActionMessage({
        type: "error",
        text:
          err?.response?.data?.error?.message ||
          err?.message ||
          "Failed to update plan. Please try again.",
      });
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (canceling || confirmCancelText !== "CANCEL") return;
    setCanceling(true);
    setActionMessage(null);
    try {
      const res = await api.post("/billing/cancel");
      setShowCancelModal(false);
      setConfirmCancelText("");
      setActionMessage({
        type: "success",
        text:
          res.data?.message ||
          "Subscription cancelled. Your access remains active until your prepaid period ends.",
      });
      try {
        sessionStorage.removeItem("ximo_billing_subscription");
        sessionStorage.removeItem("ximo_client_workspace");
      } catch {}
      await fetchSubscription(false);
    } catch (err) {
      setActionMessage({
        type: "error",
        text:
          err?.response?.data?.error?.message ||
          err?.message ||
          "Failed to cancel subscription. Please try again.",
      });
    } finally {
      setCanceling(false);
    }
  };

  const fetchSubscription = useCallback(
    async (background = false) => {
      if (!background && !subscription) setLoading(true);
      setError(null);
      setIsPermissionDenied(false);

      try {
        const response = await api.get("/billing/subscription");
        setSubscription(response.data);
        try {
          sessionStorage.setItem(
            "ximo_billing_subscription",
            JSON.stringify(response.data),
          );
        } catch {}
      } catch (err) {
        if (err?.response?.status === 403) {
          setIsPermissionDenied(true);
          setError(
            "Only your organization’s billing administrator can manage the subscription.",
          );
        } else if (!subscription) {
          setError(
            err?.response?.data?.error?.message ||
              "We couldn’t load billing details. Try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [subscription],
  );

  useEffect(() => {
    if (hasLoadedInitialSubscription.current) return;
    hasLoadedInitialSubscription.current = true;
    fetchSubscription(Boolean(subscription));
  }, [fetchSubscription, subscription]);

  const statusInfo =
    STATUS_CONFIG[subscription?.status] || STATUS_CONFIG.active;
  const isDowngrade =
    subscription?.plan?.code === "business" && selectedTargetPlan === "starter";

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Plan & billing"
        description="Subscription status, included capabilities, and renewal options."
        actions={
          <Link to="/client" className="text-sm font-semibold text-primary">
            Workspace
          </Link>
        }
      />

      {/* Loading State */}
      {loading && (
        <div className="portal-surface flex min-h-52 flex-col items-center justify-center gap-4 px-4 py-10">
          <Spinner size="lg" />
          <p className="text-xs font-medium text-[#5A685D]">
            Loading your subscription…
          </p>
        </div>
      )}

      {/* Permission Denied State */}
      {!loading && isPermissionDenied && (
        <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-4">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-lg font-semibold text-amber-700">
            🔒
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-amber-900">
              Access Restricted
            </h3>
            <p className="text-xs text-amber-800">
              Only your organization’s billing administrator can manage the
              subscription.
            </p>
          </div>
          <p className="text-[11px] text-amber-700">
            Contact your store owner to request billing administrative access.
          </p>
        </div>
      )}

      {/* General Error State */}
      {!loading && !isPermissionDenied && error && (
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
          <p className="text-xs font-medium text-red-700">{error}</p>
          <Button onClick={fetchSubscription} className="min-h-[44px]">
            Try Again
          </Button>
        </div>
      )}

      {/* Main Content */}
      {!loading &&
        !error &&
        subscription &&
        (() => {
          const accessState = getSubscriptionAccessState(subscription);
          const canRenew = subscription.availableActions?.some(
            (a) => a.code === "renew" && a.isEnabled,
          );
          const isTestBilling =
            subscription.paymentMethodSummary ===
            "Test Payment Method (Sandbox)";
          const billingSetupUnavailable =
            !subscription.paymentMethodSummary &&
            !Object.values(subscription.providerCapabilities || {}).some(
              Boolean,
            );

          return (
            <div className="space-y-8">
              {/* Environment Action Banner */}
              {actionMessage && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-medium ${
                    actionMessage.type === "error"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}
                >
                  {actionMessage.text}
                </div>
              )}

              {/* Status Presentation Banner */}
              <div className="portal-surface space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <StatusBadge value={subscription.status} />
                    <h2 className="text-xl font-extrabold text-[#1F2923] mt-2">
                      {statusInfo.title}
                    </h2>
                    <p className="text-xs text-[#5A685D]">{statusInfo.desc}</p>
                  </div>

                  {/* Renewal Details */}
                  <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F0F4F1]">
                    <p className="text-xs text-[#5A685D]">
                      Next Renewal / Period End
                    </p>
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
                      Your payment was received, but store setup is not
                      complete.
                    </p>
                    <p className="text-xs text-amber-800">
                      You do not need to pay again. Re-trigger setup or contact
                      support.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() =>
                          setActionMessage({
                            type: "success",
                            text: "Store setup retry initiated.",
                          })
                        }
                        className="min-h-[44px]"
                      >
                        Retry Setup
                      </Button>
                      <Link
                        to="/contact"
                        className="inline-flex min-h-[44px] items-center justify-center px-4 py-2 bg-white border border-amber-300 text-amber-900 font-bold text-xs rounded-xl hover:bg-amber-100"
                      >
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
                          Grace period active —{" "}
                          {accessState.countdownText || "0 days remaining"}.
                        </h4>
                        <p className="text-xs text-amber-800">
                          Your store remains fully available during the grace
                          period.
                        </p>
                        <Button
                          onClick={handleRenewSubscription}
                          disabled={renewing}
                          className="min-h-[44px]"
                        >
                          {renewing
                            ? "Starting Renewal..."
                            : "Renew Now to Avoid Interruption"}
                        </Button>
                      </>
                    )}

                    {accessState.state === "suspended" && (
                      <>
                        <h4 className="text-xs font-bold text-red-900">
                          Your subscription has ended.
                        </h4>
                        <p className="text-xs text-red-800">
                          Your data is safe. Renew to restore store access.
                        </p>
                        <Button
                          onClick={handleRenewSubscription}
                          disabled={renewing}
                          className="min-h-[44px]"
                        >
                          {renewing
                            ? "Starting Renewal..."
                            : "Renew to Restore Store Access"}
                        </Button>
                      </>
                    )}

                    {accessState.state === "active" &&
                      accessState.daysRemaining !== null &&
                      accessState.daysRemaining <= 7 && (
                        <>
                          <h4 className="text-xs font-bold text-blue-900">
                            Your subscription ends in{" "}
                            {accessState.countdownText}.
                          </h4>
                          <p className="text-xs text-blue-800">
                            This is a one-time renewal payment. Automatic
                            renewal is not enabled.
                          </p>
                          <Button
                            onClick={handleRenewSubscription}
                            disabled={renewing}
                            className="min-h-[44px]"
                          >
                            {renewing ? "Starting Renewal..." : "Renew Now"}
                          </Button>
                        </>
                      )}

                    {accessState.state === "active" &&
                      (accessState.daysRemaining === null ||
                        accessState.daysRemaining > 7) && (
                        <>
                          <h4 className="text-xs font-bold text-blue-900">
                            Your plan is paid through{" "}
                            {accessState.formattedPeriodEnd}.
                          </h4>
                          <p className="text-xs text-blue-800">
                            This is a one-time renewal payment. Automatic
                            renewal is not enabled.
                          </p>
                          <Button
                            onClick={handleRenewSubscription}
                            disabled={renewing}
                            className="min-h-[44px]"
                          >
                            {renewing
                              ? "Starting Renewal..."
                              : "Renew for Another Month"}
                          </Button>
                        </>
                      )}
                  </div>
                )}
              </div>

              {/* Current Plan Summary & Feature Matrix */}
              <div className="portal-surface space-y-5 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0F4F1] pb-6">
                  <div>
                    <p className="text-sm font-medium text-[#65736A]">
                      Current plan
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-[#1F2923]">
                      {subscription.plan.displayName}
                    </h3>
                    <p className="text-xs text-[#5A685D] mt-1">
                      {subscription.plan.shortDescription}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-3xl font-black text-[#1F2923]">
                      {subscription.plan.monthlyPrice == null
                        ? "Contact support"
                        : `₱${Number(subscription.plan.monthlyPrice).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
                    </span>
                    <span className="text-xs text-[#5A685D] block">
                      {subscription.plan.monthlyPrice == null ? "for renewal pricing" : "/month"}
                    </span>
                  </div>
                </div>

                {subscription.plan.features?.length > 0 && (
                  <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[#25352B]">
                    Package highlights
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subscription.plan.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center justify-between gap-3 border-b border-[#EDF1EE] px-1 py-3 text-sm last:border-b-0"
                        >
                          <span className="font-semibold text-[#1F2923]">
                            {feature}
                          </span>
                          <span className="shrink-0 font-semibold text-[#1A593B]">Included</span>
                        </div>
                    ))}
                  </div>
                  </div>
                )}

                {/* Plan Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#F0F4F1]">
                  {subscription.providerCapabilities?.canChangePlan && (
                    <Button
                    onClick={() => {
                      setSelectedTargetPlan(
                        subscription?.plan?.code === "business"
                          ? "starter"
                          : "business",
                      );
                      setShowChangePlanModal(true);
                    }}
                    className="min-h-[44px]"
                  >
                    Change Plan
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => setShowCancelModal(true)}
                    className="min-h-[44px]"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="portal-surface p-4 sm:p-6 space-y-3">
                <h3 className="text-base font-semibold text-[#25352B]">
                  Payment method
                </h3>
                <div className="border-t border-[#EDF1EE] pt-3 text-sm text-[#5A685D]">
                  {subscription.paymentMethodSummary ||
                    "Payment method details are not available yet."}
                </div>
                {isTestBilling ? (
                  <p className="rounded-xl border border-[#D8E5DA] bg-[#F4F8F4] px-3 py-2 text-xs leading-5 text-[#41604A]">
                    Test billing action — no real payment will be processed.
                  </p>
                ) : null}
                {billingSetupUnavailable ? (
                  <div className="flex flex-col gap-3 border-t border-[#EDF1EE] pt-3 text-sm text-[#5A685D] sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Online billing management is not available yet. Contact
                      Ximo support.
                    </p>
                    <Link
                      to="/contact"
                      className="shrink-0 font-semibold text-[#1A593B] hover:text-[#164A32]"
                    >
                      Contact Sales
                    </Link>
                  </div>
                ) : null}
              </div>

              {/* Invoice History Section */}
              <div className="portal-surface p-4 sm:p-6 space-y-3">
                <h3 className="text-base font-semibold text-[#25352B]">
                  Invoice history
                </h3>
                <div className="border-t border-[#EDF1EE] py-6 text-center text-sm text-[#5A685D]">
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
                { code: "starter", name: "Starter Plan", price: "₱999.00/mo" },
                {
                  code: "business",
                  name: "Standard Plan",
                  price: "₱1,999.00/mo",
                },
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

          {/* Upgrade / Downgrade Guidance Banner */}
          {selectedTargetPlan === "business" &&
          (subscription?.plan?.code || "starter") === "starter" ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
              <p className="font-bold text-emerald-900">
                Upgrade to Standard Plan (₱1,999.00 / month)
              </p>
              <p className="text-emerald-800">
                You will be redirected to PayMongo QR Ph to review the current
                subscription amount. Your account upgrades to Standard upon
                confirmed payment.
              </p>
            </div>
          ) : isDowngrade ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
              <p className="font-bold text-amber-900">Downgrade Notice</p>
              <p className="text-amber-800">
                Your data will not be deleted. Features outside the new plan
                will become unavailable after the switch.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-[#EBF3ED] border border-[#D5E3D8] rounded-xl text-xs text-[#2A4B36]">
              Your plan features will be updated for your store.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E8E2]">
            <Button
              variant="ghost"
              onClick={() => setShowChangePlanModal(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => handleChangePlan(true)}
              disabled={
                changingPlan ||
                selectedTargetPlan === (subscription?.plan?.code || "starter")
              }
              className="min-h-[44px]"
            >
              {changingPlan
                ? "Connecting to Payment…"
                : selectedTargetPlan === (subscription?.plan?.code || "starter")
                  ? "Current Plan"
                  : selectedTargetPlan === "business" &&
                      (subscription?.plan?.code || "starter") === "starter"
                    ? "Review QR Ph payment & Upgrade"
                    : `Confirm Switch to ${selectedTargetPlan === "business" ? "Standard" : "Starter"}`}
            </Button>
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
            <p className="font-bold text-red-900">
              Are you sure you want to cancel?
            </p>
            {subscription?.currentPeriodEnd &&
            !isNaN(new Date(subscription.currentPeriodEnd).getTime()) ? (
              <p className="text-red-800">
                You’ll keep access until{" "}
                <strong>
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    "en-PH",
                    {
                      timeZone: "Asia/Manila",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </strong>
                . Your store data will be preserved.
              </p>
            ) : (
              <p className="text-red-800 font-bold">
                We couldn’t determine your paid-through date. Contact Ximo
                support before canceling.
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

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            Your store operations and data remain active until your current
            prepaid period ends.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E8E2]">
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              disabled={confirmCancelText !== "CANCEL" || canceling}
              onClick={handleCancelSubscription}
              className="min-h-[44px]"
            >
              {canceling ? "Canceling…" : "Confirm Cancellation"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
