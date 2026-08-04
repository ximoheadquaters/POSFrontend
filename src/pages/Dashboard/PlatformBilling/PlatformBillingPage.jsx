import { useState, useEffect } from "react";
import api from "../../../app/axios";
import Spinner from "../../../components/common/Spinner";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";

export default function PlatformBillingPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Overview Data
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Subscriptions Data
  const [subscriptions, setSubscriptions] = useState([]);
  const [subPagination, setSubPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [subFilter, setSubFilter] = useState({ status: "", search: "" });
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Checkouts Data
  const [checkouts, setCheckouts] = useState([]);
  const [chkPagination, setChkPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loadingChks, setLoadingChks] = useState(false);

  // Webhooks Data
  const [webhooks, setWebhooks] = useState([]);
  const [whPagination, setWhPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loadingWhs, setLoadingWhs] = useState(false);

  // Modals & Action States
  const [actionMessage, setActionMessage] = useState(null);
  const [modalType, setModalType] = useState(null); // 'extend_trial', 'suspend', 'reactivate', 'retry_provisioning', 'reprocess_webhook'
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [reasonInput, setReasonInput] = useState("");
  const [trialDaysInput, setTrialDaysInput] = useState("14");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Fetch Overview
  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await api.get("/admin/billing/overview");
      setOverview(res.data);
    } catch (err) {
      setActionMessage({ type: "error", text: err?.response?.data?.error?.message || "Failed to load billing overview." });
    } finally {
      setLoadingOverview(false);
    }
  };

  // Fetch Subscriptions
  const fetchSubscriptions = async (page = 1) => {
    setLoadingSubs(true);
    try {
      const params = { page, limit: 10, status: subFilter.status, search: subFilter.search };
      const res = await api.get("/admin/billing/subscriptions", { params });
      setSubscriptions(res.data.data);
      setSubPagination(res.data.pagination);
    } catch (err) {
      setActionMessage({ type: "error", text: "Failed to load subscriptions list." });
    } finally {
      setLoadingSubs(false);
    }
  };

  // Fetch Checkouts
  const fetchCheckouts = async (page = 1) => {
    setLoadingChks(true);
    try {
      const params = { page, limit: 10 };
      const res = await api.get("/admin/billing/checkouts", { params });
      setCheckouts(res.data.data);
      setChkPagination(res.data.pagination);
    } catch (err) {
      setActionMessage({ type: "error", text: "Failed to load checkouts list." });
    } finally {
      setLoadingChks(false);
    }
  };

  // Fetch Webhooks
  const fetchWebhooks = async (page = 1) => {
    setLoadingWhs(true);
    try {
      const params = { page, limit: 10 };
      const res = await api.get("/admin/billing/webhooks", { params });
      setWebhooks(res.data.data);
      setWhPagination(res.data.pagination);
    } catch (err) {
      setActionMessage({ type: "error", text: "Failed to load webhooks list." });
    } finally {
      setLoadingWhs(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === "subscriptions") fetchSubscriptions(1);
    if (activeTab === "checkouts") fetchCheckouts(1);
    if (activeTab === "webhooks") fetchWebhooks(1);
  }, [activeTab, subFilter.status, subFilter.search]);

  // Handle Operational Actions
  const handleActionSubmit = async () => {
    if (!reasonInput || reasonInput.trim().length === 0) {
      setActionMessage({ type: "error", text: "Reason is required for platform operational actions." });
      return;
    }

    setSubmittingAction(true);
    setActionMessage(null);

    try {
      if (modalType === "extend_trial") {
        await api.post(`/admin/billing/subscriptions/${selectedTarget.id}/extend-trial`, {
          days: parseInt(trialDaysInput, 10),
          reason: reasonInput.trim()
        });
        setActionMessage({ type: "success", text: `Trial extended by ${trialDaysInput} days for ${selectedTarget.organizationName}.` });
        fetchSubscriptions(subPagination.page);
      } else if (modalType === "suspend") {
        await api.post(`/admin/billing/subscriptions/${selectedTarget.id}/suspend`, {
          reason: reasonInput.trim()
        });
        setActionMessage({ type: "success", text: `Subscription suspended for ${selectedTarget.organizationName}.` });
        fetchSubscriptions(subPagination.page);
      } else if (modalType === "reactivate") {
        await api.post(`/admin/billing/subscriptions/${selectedTarget.id}/reactivate`, {
          reason: reasonInput.trim()
        });
        setActionMessage({ type: "success", text: `Subscription reactivated for ${selectedTarget.organizationName}.` });
        fetchSubscriptions(subPagination.page);
      } else if (modalType === "retry_provisioning") {
        await api.post(`/admin/billing/checkouts/${selectedTarget.id}/retry-provisioning`, {
          reason: reasonInput.trim()
        });
        setActionMessage({ type: "success", text: `Provisioning retry triggered for ${selectedTarget.organizationName}.` });
        fetchCheckouts(chkPagination.page);
      } else if (modalType === "reprocess_webhook") {
        await api.post(`/admin/billing/webhooks/${selectedTarget.id}/reprocess`, {
          reason: reasonInput.trim()
        });
        setActionMessage({ type: "success", text: `Webhook ${selectedTarget.providerEventId} reprocessed.` });
        fetchWebhooks(whPagination.page);
      }

      setModalType(null);
      setSelectedTarget(null);
      setReasonInput("");
      fetchOverview();
    } catch (err) {
      setActionMessage({ type: "error", text: err?.response?.data?.error?.message || "Operation failed." });
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Permanent Test Environment Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 font-semibold">
        <span>⚙️ Platform Billing Console — Test billing environment (no real payment provider is connected).</span>
        <span className="px-2.5 py-0.5 bg-blue-100 border border-blue-300 rounded-full font-bold uppercase text-[10px]">
          Sandbox Mode
        </span>
      </div>

      {/* Page Title */}
      <div className="border-b border-[#E1E8E2] pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1F2923]">Platform Billing Operations</h1>
          <p className="text-xs text-[#5A685D] mt-1">
            Super-admin tooling to monitor subscriptions, inspect webhooks, and manage provisioning recoveries.
          </p>
        </div>
      </div>

      {/* Global Notification Banner */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold ${
          actionMessage.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}>
          {actionMessage.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E1E8E2] space-x-4 text-xs font-bold">
        {[
          { key: "overview", label: "Overview Metrics" },
          { key: "subscriptions", label: "Subscriptions" },
          { key: "checkouts", label: "Checkout Sessions" },
          { key: "webhooks", label: "Webhook Events" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-1 border-b-2 font-bold transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-[#5A685D] hover:text-[#1F2923]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div>
          {loadingOverview ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "Active Subscriptions", count: overview?.activeSubscriptionsCount, color: "border-emerald-200 bg-emerald-50 text-emerald-900" },
                { label: "Active Trials", count: overview?.trialsCount, color: "border-blue-200 bg-blue-50 text-blue-900" },
                { label: "Past Due", count: overview?.pastDueCount, color: "border-amber-200 bg-amber-50 text-amber-900" },
                { label: "Suspended", count: overview?.suspendedCount, color: "border-red-200 bg-red-50 text-red-900" },
                { label: "Canceled", count: overview?.canceledCount, color: "border-gray-200 bg-gray-50 text-gray-900" },
                { label: "Provisioning Failures", count: overview?.paidProvisioningFailuresCount, color: "border-orange-200 bg-orange-50 text-orange-900" },
                { label: "Provisioning in Progress", count: overview?.provisioningInProgressCount, color: "border-purple-200 bg-purple-50 text-purple-900" },
                { label: "Failed Webhooks", count: overview?.failedWebhooksCount, color: "border-pink-200 bg-pink-50 text-pink-900" },
                { label: "Awaiting Verification", count: overview?.checkoutsAwaitingVerificationCount, color: "border-cyan-200 bg-cyan-50 text-cyan-900" },
                { label: "Awaiting Payment", count: overview?.checkoutsAwaitingPaymentCount, color: "border-teal-200 bg-teal-50 text-teal-900" }
              ].map((card, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border space-y-1 ${card.color}`}>
                  <p className="text-[11px] font-bold uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-black">{card.count ?? 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBSCRIPTIONS TAB */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <input
              type="text"
              placeholder="Search by organization or email..."
              value={subFilter.search}
              onChange={(e) => setSubFilter({ ...subFilter, search: e.target.value })}
              className="px-3.5 py-2 bg-white border border-[#E1E8E2] rounded-xl text-xs min-h-[44px] sm:w-80"
            />
            <select
              value={subFilter.status}
              onChange={(e) => setSubFilter({ ...subFilter, status: e.target.value })}
              className="px-3.5 py-2 bg-white border border-[#E1E8E2] rounded-xl text-xs min-h-[44px]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="suspended">Suspended</option>
              <option value="provisioning_failed">Provisioning Failed</option>
            </select>
          </div>

          {loadingSubs ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E1E8E2] overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F9FBF9] border-b border-[#E1E8E2] text-[#5A685D] font-bold">
                    <th className="p-4">Organization</th>
                    <th className="p-4">Owner Email</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Period End</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F1]">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#F9FBF9]">
                      <td className="p-4 font-bold text-[#1F2923]">
                        {sub.organizationName}
                        {sub.operationalWarning && (
                          <span className="block text-[10px] text-amber-700 font-normal mt-0.5">
                            ⚠️ {sub.operationalWarning}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-[#5A685D]">{sub.ownerEmail}</td>
                      <td className="p-4 font-medium capitalize">{sub.planDisplayName || sub.planCode}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full border bg-gray-100 text-gray-800 border-gray-200">
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#5A685D]">
                        {new Date(sub.currentPeriodEnd).toLocaleDateString("en-PH")}
                      </td>
                      <td className="p-4 flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => { setSelectedTarget(sub); setModalType("extend_trial"); }}
                          className="text-[11px] px-2.5 py-1 min-h-[36px]"
                        >
                          Extend Trial
                        </Button>
                        {sub.status === "suspended" ? (
                          <Button
                            onClick={() => { setSelectedTarget(sub); setModalType("reactivate"); }}
                            className="text-[11px] px-2.5 py-1 min-h-[36px]"
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            onClick={() => { setSelectedTarget(sub); setModalType("suspend"); }}
                            className="text-[11px] px-2.5 py-1 min-h-[36px]"
                          >
                            Suspend
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Server-side Pagination Controls */}
              <div className="p-4 border-t border-[#E1E8E2] flex items-center justify-between text-xs text-[#5A685D]">
                <span>Page {subPagination.page} of {subPagination.totalPages} ({subPagination.total} items)</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    disabled={subPagination.page <= 1}
                    onClick={() => fetchSubscriptions(subPagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={subPagination.page >= subPagination.totalPages}
                    onClick={() => fetchSubscriptions(subPagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHECKOUT SESSIONS TAB */}
      {activeTab === "checkouts" && (
        <div className="space-y-4">
          {loadingChks ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E1E8E2] overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F9FBF9] border-b border-[#E1E8E2] text-[#5A685D] font-bold">
                    <th className="p-4">Session ID</th>
                    <th className="p-4">Masked Token</th>
                    <th className="p-4">Organization & Owner</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment Confirmed</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F1]">
                  {checkouts.map((chk) => (
                    <tr key={chk.id} className="hover:bg-[#F9FBF9]">
                      <td className="p-4 font-mono font-bold">{chk.id}</td>
                      <td className="p-4 font-mono text-gray-500">{chk.publicTokenMasked}</td>
                      <td className="p-4">
                        <p className="font-bold text-[#1F2923]">{chk.organizationName}</p>
                        <p className="text-[11px] text-[#5A685D]">{chk.ownerEmail}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full border bg-gray-100 text-gray-800 border-gray-200">
                          {chk.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#5A685D]">
                        {chk.paymentConfirmedAt ? new Date(chk.paymentConfirmedAt).toLocaleTimeString() : "Unpaid"}
                      </td>
                      <td className="p-4">
                        {/* Provisioning Retry Button Requirements */}
                        {chk.paymentConfirmedAt && chk.emailVerifiedAt && chk.status !== "active" ? (
                          <Button
                            disabled={chk.status === "provisioning"}
                            onClick={() => { setSelectedTarget(chk); setModalType("retry_provisioning"); }}
                            className="text-[11px] px-2 py-1 min-h-[36px]"
                          >
                            {chk.status === "provisioning" ? "Retry Running..." : "Retry Setup"}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            {!chk.paymentConfirmedAt ? "Unpaid checkout" : !chk.emailVerifiedAt ? "Email unverified" : "Completed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="p-4 border-t border-[#E1E8E2] flex items-center justify-between text-xs text-[#5A685D]">
                <span>Page {chkPagination.page} of {chkPagination.totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" disabled={chkPagination.page <= 1} onClick={() => fetchCheckouts(chkPagination.page - 1)}>
                    Previous
                  </Button>
                  <Button variant="ghost" disabled={chkPagination.page >= chkPagination.totalPages} onClick={() => fetchCheckouts(chkPagination.page + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WEBHOOK EVENTS TAB */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          {loadingWhs ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E1E8E2] overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F9FBF9] border-b border-[#E1E8E2] text-[#5A685D] font-bold">
                    <th className="p-4">Provider Event ID</th>
                    <th className="p-4">Event Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Received At</th>
                    <th className="p-4">Error Summary</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F1]">
                  {webhooks.map((wh) => (
                    <tr key={wh.id} className="hover:bg-[#F9FBF9]">
                      <td className="p-4 font-mono font-bold">{wh.providerEventId}</td>
                      <td className="p-4 font-mono text-gray-700">{wh.eventType}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                          wh.processingStatus === "completed" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200"
                        }`}>
                          {wh.processingStatus}
                        </span>
                      </td>
                      <td className="p-4 text-[#5A685D]">{new Date(wh.receivedAt).toLocaleString()}</td>
                      <td className="p-4 text-red-700 font-mono text-[11px] max-w-xs truncate">
                        {wh.errorSummary || "—"}
                      </td>
                      <td className="p-4">
                        {wh.processingStatus === "failed" ? (
                          <Button
                            onClick={() => { setSelectedTarget(wh); setModalType("reprocess_webhook"); }}
                            className="text-[11px] px-2 py-1 min-h-[36px]"
                          >
                            Reprocess
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 border-t border-[#E1E8E2] flex items-center justify-between text-xs text-[#5A685D]">
                <span>Page {whPagination.page} of {whPagination.totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" disabled={whPagination.page <= 1} onClick={() => fetchWebhooks(whPagination.page - 1)}>
                    Previous
                  </Button>
                  <Button variant="ghost" disabled={whPagination.page >= whPagination.totalPages} onClick={() => fetchWebhooks(whPagination.page + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OPERATIONAL ACTION MODAL */}
      <Modal
        isOpen={!!modalType}
        onClose={() => { setModalType(null); setSelectedTarget(null); setReasonInput(""); }}
        title="Super-Admin Operational Action"
      >
        <div className="space-y-6 text-xs text-[#39423B]">
          <p className="font-bold text-[#1F2923]">
            Action Target: <span className="font-normal">{selectedTarget?.organizationName || selectedTarget?.providerEventId || selectedTarget?.id}</span>
          </p>

          {/* Trial Extension Days Input */}
          {modalType === "extend_trial" && (
            <div className="space-y-1">
              <label className="block font-bold text-[#1F2923]">Extension Days (1-90):</label>
              <input
                type="number"
                min="1"
                max="90"
                value={trialDaysInput}
                onChange={(e) => setTrialDaysInput(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-[#F9FBF9] border border-[#E1E8E2] rounded-xl text-xs font-mono"
              />
            </div>
          )}

          {/* Suspension Warning */}
          {modalType === "suspend" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 font-semibold space-y-1">
              <p>⚠️ Operational Warning:</p>
              <p className="font-normal text-red-800">Users may lose operational access. Store data will remain preserved.</p>
            </div>
          )}

          {/* Reactivation Explanation */}
          {modalType === "reactivate" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-semibold space-y-1">
              <p>ℹ️ Reactivation Notice:</p>
              <p className="font-normal text-emerald-800">Access will be restored according to the organization’s plan, modules, and user permissions.</p>
            </div>
          )}

          {/* Reason Input Requirement */}
          <div className="space-y-1">
            <label className="block font-bold text-[#1F2923]">
              Audit Reason (Required):
            </label>
            <input
              type="text"
              required
              placeholder="Enter operational reason for audit trail..."
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-[#F9FBF9] border border-[#E1E8E2] rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E8E2]">
            <Button variant="ghost" onClick={() => { setModalType(null); setSelectedTarget(null); setReasonInput(""); }}>
              Cancel
            </Button>
            <Button
              loading={submittingAction}
              disabled={!reasonInput || reasonInput.trim().length === 0}
              onClick={handleActionSubmit}
            >
              Confirm Operational Action
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
