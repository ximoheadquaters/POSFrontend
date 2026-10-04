import { useCallback, useEffect, useState } from "react";
import api from "../../../app/axios";
import Spinner from "../../../components/common/Spinner";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import { PageHeader, StatusBadge } from "../../../components/pos/PosUi";

const sections = [
  { key: "overview", label: "Overview" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "checkouts", label: "Checkout sessions" },
  { key: "webhooks", label: "Webhook events" },
];

function formatDate(value, options = {}) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

function actionTitle(type) {
  return (
    {
      extend_trial: "Extend trial",
      suspend: "Suspend subscription",
      reactivate: "Reactivate subscription",
      retry_provisioning: "Retry setup",
      reprocess_webhook: "Reprocess webhook",
    }[type] || "Operational action"
  );
}

function metricCount(value) {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

export default function PlatformBillingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subPagination, setSubPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [subFilter, setSubFilter] = useState({ status: "", search: "" });
  const [debouncedSubscriptionSearch, setDebouncedSubscriptionSearch] =
    useState("");
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [checkouts, setCheckouts] = useState([]);
  const [chkPagination, setChkPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loadingChks, setLoadingChks] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [whPagination, setWhPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loadingWhs, setLoadingWhs] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [reasonInput, setReasonInput] = useState("");
  const [trialDaysInput, setTrialDaysInput] = useState("14");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [showOverviewDetails, setShowOverviewDetails] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const response = await api.get("/admin/billing/overview");
      setOverview(response.data);
    } catch (error) {
      setActionMessage({
        type: "error",
        text:
          error?.response?.data?.error?.message ||
          "Billing overview could not be loaded.",
      });
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async (page = 1, filter = {}) => {
    setLoadingSubs(true);
    try {
      const response = await api.get("/admin/billing/subscriptions", {
        params: {
          page,
          limit: 10,
          status: filter.status || "",
          search: filter.search || "",
        },
      });
      setSubscriptions(response.data.data || []);
      setSubPagination(
        response.data.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      );
    } catch {
      setActionMessage({
        type: "error",
        text: "Subscriptions could not be loaded.",
      });
    } finally {
      setLoadingSubs(false);
    }
  }, []);

  const fetchCheckouts = useCallback(async (page = 1) => {
    setLoadingChks(true);
    try {
      const response = await api.get("/admin/billing/checkouts", {
        params: { page, limit: 10 },
      });
      setCheckouts(response.data.data || []);
      setChkPagination(
        response.data.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      );
    } catch {
      setActionMessage({
        type: "error",
        text: "Checkout sessions could not be loaded.",
      });
    } finally {
      setLoadingChks(false);
    }
  }, []);

  const fetchWebhooks = useCallback(async (page = 1) => {
    setLoadingWhs(true);
    try {
      const response = await api.get("/admin/billing/webhooks", {
        params: { page, limit: 10 },
      });
      setWebhooks(response.data.data || []);
      setWhPagination(
        response.data.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      );
    } catch {
      setActionMessage({
        type: "error",
        text: "Webhook events could not be loaded.",
      });
    } finally {
      setLoadingWhs(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSubscriptionSearch(subFilter.search);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [subFilter.search]);

  useEffect(() => {
    if (activeTab === "subscriptions") {
      fetchSubscriptions(1, {
        status: subFilter.status,
        search: debouncedSubscriptionSearch,
      });
    }
    if (activeTab === "checkouts") fetchCheckouts(1);
    if (activeTab === "webhooks") fetchWebhooks(1);
  }, [
    activeTab,
    debouncedSubscriptionSearch,
    fetchCheckouts,
    fetchSubscriptions,
    fetchWebhooks,
    subFilter.status,
  ]);

  const openAction = (type, target) => {
    setActionMessage(null);
    setSelectedTarget(target);
    setModalType(type);
  };

  const closeAction = () => {
    if (submittingAction) return;
    setModalType(null);
    setSelectedTarget(null);
    setReasonInput("");
  };

  const handleActionSubmit = async () => {
    if (!reasonInput.trim()) {
      setActionMessage({
        type: "error",
        text: "Add a reason so this change is recorded.",
      });
      return;
    }

    setSubmittingAction(true);
    setActionMessage(null);
    try {
      if (modalType === "extend_trial") {
        await api.post(
          `/admin/billing/subscriptions/${selectedTarget.id}/extend-trial`,
          {
            days: Number.parseInt(trialDaysInput, 10),
            reason: reasonInput.trim(),
          },
        );
        setActionMessage({
          type: "success",
          text: `Trial extended by ${trialDaysInput} days for ${selectedTarget.organizationName}.`,
        });
        fetchSubscriptions(subPagination.page, {
          status: subFilter.status,
          search: debouncedSubscriptionSearch,
        });
      } else if (modalType === "suspend") {
        await api.post(
          `/admin/billing/subscriptions/${selectedTarget.id}/suspend`,
          { reason: reasonInput.trim() },
        );
        setActionMessage({
          type: "success",
          text: `Subscription suspended for ${selectedTarget.organizationName}.`,
        });
        fetchSubscriptions(subPagination.page, {
          status: subFilter.status,
          search: debouncedSubscriptionSearch,
        });
      } else if (modalType === "reactivate") {
        await api.post(
          `/admin/billing/subscriptions/${selectedTarget.id}/reactivate`,
          { reason: reasonInput.trim() },
        );
        setActionMessage({
          type: "success",
          text: `Subscription reactivated for ${selectedTarget.organizationName}.`,
        });
        fetchSubscriptions(subPagination.page, {
          status: subFilter.status,
          search: debouncedSubscriptionSearch,
        });
      } else if (modalType === "retry_provisioning") {
        await api.post(
          `/admin/billing/checkouts/${selectedTarget.id}/retry-provisioning`,
          { reason: reasonInput.trim() },
        );
        setActionMessage({
          type: "success",
          text: `Setup retry started for ${selectedTarget.organizationName}.`,
        });
        fetchCheckouts(chkPagination.page);
      } else if (modalType === "reprocess_webhook") {
        await api.post(
          `/admin/billing/webhooks/${selectedTarget.id}/reprocess`,
          { reason: reasonInput.trim() },
        );
        setActionMessage({
          type: "success",
          text: `Webhook ${selectedTarget.providerEventId} was queued for processing.`,
        });
        fetchWebhooks(whPagination.page);
      }
      setModalType(null);
      setSelectedTarget(null);
      setReasonInput("");
      fetchOverview();
    } catch (error) {
      setActionMessage({
        type: "error",
        text:
          error?.response?.data?.error?.message ||
          "The operation could not be completed.",
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const attentionCount = [
    overview?.paidProvisioningFailuresCount,
    overview?.failedWebhooksCount,
    overview?.checkoutsAwaitingVerificationCount,
    overview?.checkoutsAwaitingPaymentCount,
  ].reduce((total, value) => total + metricCount(value), 0);

  const summaryMetrics = [
    ["Active subscriptions", overview?.activeSubscriptionsCount],
    ["Active trials", overview?.trialsCount],
    ["Past due", overview?.pastDueCount],
    ["Needs review", attentionCount],
  ];
  const detailMetrics = [
    ["Suspended", overview?.suspendedCount],
    ["Canceled", overview?.canceledCount],
    ["Setup failures", overview?.paidProvisioningFailuresCount],
    ["Setup in progress", overview?.provisioningInProgressCount],
    ["Failed webhooks", overview?.failedWebhooksCount],
    ["Awaiting verification", overview?.checkoutsAwaitingVerificationCount],
    ["Awaiting payment", overview?.checkoutsAwaitingPaymentCount],
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Billing activity"
        description="Subscriptions, checkout sessions, and payment provider events."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchOverview}
            disabled={loadingOverview}
          >
            Refresh
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-[#D8E5DA] bg-[#F4F8F4] px-4 py-3 text-sm leading-5 text-[#41604A]">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[#E0EDE2] text-xs font-semibold text-[#1A593B]">
          i
        </span>
        <p>Test billing environment. No payment provider is connected.</p>
      </div>

      {actionMessage ? (
        <div
          role={actionMessage.type === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            actionMessage.type === "error"
              ? "border-[#EDC5C0] bg-[#FCECEA] text-[#8A3028]"
              : "border-[#C9DDCE] bg-[#EEF6F0] text-[#1A593B]"
          }`}
        >
          {actionMessage.text}
        </div>
      ) : null}

      <section className="portal-surface">
        <div className="flex items-center justify-between gap-3 border-b border-[#E8EEE9] px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 className="portal-section-heading">Operations</h2>
            <p className="portal-supporting-copy mt-0.5 hidden sm:block">
              Choose a billing area to review or act on.
            </p>
          </div>
          <label className="block w-40 shrink-0 sm:w-56">
            <span className="sr-only">Billing section</span>
            <select
              value={activeTab}
              onChange={(event) => setActiveTab(event.target.value)}
              className="min-h-10 w-full rounded-xl border border-[#D7E1D9] bg-white px-3 text-sm font-medium text-[#25352B]"
            >
              {sections.map((section) => (
                <option key={section.key} value={section.key}>
                  {section.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeTab === "overview" ? (
          loadingOverview ? (
            <LoadingBlock />
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-4 sm:gap-3 sm:p-5">
                {summaryMetrics.map(([label, value]) => (
                  <article
                    key={label}
                    className="min-w-0 rounded-xl border border-[#E1EAE3] bg-[#FCFDFC] px-3 py-3 sm:px-4"
                  >
                    <p className="text-[11px] font-medium leading-4 text-[#65736A] sm:text-xs">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#25352B] sm:text-[28px]">
                      {value ?? 0}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-[#748177] sm:text-xs">
                      {label === "Needs review"
                        ? "Setup and checkout"
                        : "Billing status"}
                    </p>
                  </article>
                ))}
              </div>

              <div className="border-t border-[#E8EEE9]">
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8FAF8] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5"
                  onClick={() => setShowOverviewDetails((open) => !open)}
                  aria-expanded={showOverviewDetails}
                  aria-controls="billing-overview-details"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#25352B]">
                      Additional status
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[#748177]">
                      Suspended, setup, and checkout counts
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs font-semibold text-primary">
                    {showOverviewDetails ? "Hide details" : "View details"}
                    {attentionCount ? ` · ${attentionCount} to review` : ""}
                  </span>
                </button>

                {showOverviewDetails ? (
                  <div
                    id="billing-overview-details"
                    className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-[#E8EEE9] px-4 py-4 sm:grid-cols-4 sm:px-5"
                  >
                    {detailMetrics.map(([label, value]) => (
                      <dl key={label} className="min-w-0">
                        <dt className="text-[11px] leading-4 text-[#65736A] sm:text-xs">
                          {label}
                        </dt>
                        <dd className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[#25352B]">
                          {value ?? 0}
                        </dd>
                      </dl>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )
        ) : null}

        {activeTab === "subscriptions" ? (
          <SubscriptionsPanel
            items={subscriptions}
            loading={loadingSubs}
            filter={subFilter}
            onFilter={setSubFilter}
            pagination={subPagination}
            onPrevious={() =>
              fetchSubscriptions(subPagination.page - 1, {
                status: subFilter.status,
                search: debouncedSubscriptionSearch,
              })
            }
            onNext={() =>
              fetchSubscriptions(subPagination.page + 1, {
                status: subFilter.status,
                search: debouncedSubscriptionSearch,
              })
            }
            onAction={openAction}
          />
        ) : null}

        {activeTab === "checkouts" ? (
          <CheckoutsPanel
            items={checkouts}
            loading={loadingChks}
            pagination={chkPagination}
            onPrevious={() => fetchCheckouts(chkPagination.page - 1)}
            onNext={() => fetchCheckouts(chkPagination.page + 1)}
            onAction={openAction}
          />
        ) : null}

        {activeTab === "webhooks" ? (
          <WebhooksPanel
            items={webhooks}
            loading={loadingWhs}
            pagination={whPagination}
            onPrevious={() => fetchWebhooks(whPagination.page - 1)}
            onNext={() => fetchWebhooks(whPagination.page + 1)}
            onAction={openAction}
          />
        ) : null}
      </section>

      <Modal
        isOpen={Boolean(modalType)}
        onClose={closeAction}
        title={actionTitle(modalType)}
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-[#E2EAE3] bg-[#F8FAF8] px-4 py-3 text-sm text-[#506056]">
            <p className="font-medium text-[#25352B]">
              {selectedTarget?.organizationName ||
                selectedTarget?.providerEventId ||
                selectedTarget?.id}
            </p>
            <p className="mt-1 text-xs">
              This action is recorded in the platform audit trail.
            </p>
          </div>

          {modalType === "extend_trial" ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#25352B]">
                Extension days
              </span>
              <input
                type="number"
                min="1"
                max="90"
                value={trialDaysInput}
                onChange={(event) => setTrialDaysInput(event.target.value)}
                className="w-full rounded-xl border border-[#D7E1D9] px-3 text-sm"
              />
            </label>
          ) : null}

          {modalType === "suspend" ? (
            <p className="rounded-xl border border-[#EDC5C0] bg-[#FCECEA] px-4 py-3 text-sm leading-5 text-[#8A3028]">
              Users may lose operational access. Store data remains preserved.
            </p>
          ) : null}

          {modalType === "reactivate" ? (
            <p className="rounded-xl border border-[#C9DDCE] bg-[#EEF6F0] px-4 py-3 text-sm leading-5 text-[#1A593B]">
              Access will be restored according to the organization’s plan,
              modules, and user permissions.
            </p>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#25352B]">
              Reason
            </span>
            <input
              required
              value={reasonInput}
              onChange={(event) => setReasonInput(event.target.value)}
              placeholder="Explain this operational change"
              className="w-full rounded-xl border border-[#D7E1D9] px-3 text-sm"
            />
          </label>

          <div className="flex flex-col-reverse gap-2 border-t border-[#E8EEE9] pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={closeAction}
              disabled={submittingAction}
            >
              Cancel
            </Button>
            <Button
              loading={submittingAction}
              disabled={!reasonInput.trim()}
              onClick={handleActionSubmit}
            >
              Confirm action
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex min-h-52 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function EmptyBlock({ text }) {
  return (
    <p className="px-4 py-12 text-center text-sm text-[#748177] sm:px-5">
      {text}
    </p>
  );
}

function PaginationControls({ pagination, onPrevious, onNext, countLabel }) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#E8EEE9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-[#748177]">
        Page {pagination.page} of {pagination.totalPages}
        {countLabel ? ` · ${pagination.total} ${countLabel}` : ""}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function SubscriptionsPanel({
  items,
  loading,
  filter,
  onFilter,
  pagination,
  onPrevious,
  onNext,
  onAction,
}) {
  return (
    <div>
      <div className="grid gap-3 border-b border-[#E8EEE9] px-4 py-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:px-5">
        <label className="block">
          <span className="sr-only">Search subscriptions</span>
          <input
            type="search"
            value={filter.search}
            onChange={(event) =>
              onFilter({ ...filter, search: event.target.value })
            }
            placeholder="Search organization or owner email"
            className="w-full rounded-xl border border-[#D7E1D9] px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="sr-only">Filter subscriptions by status</span>
          <select
            value={filter.status}
            onChange={(event) =>
              onFilter({ ...filter, status: event.target.value })
            }
            className="w-full rounded-xl border border-[#D7E1D9] px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past due</option>
            <option value="suspended">Suspended</option>
            <option value="provisioning_failed">Setup failed</option>
          </select>
        </label>
      </div>
      {loading ? (
        <LoadingBlock />
      ) : !items.length ? (
        <EmptyBlock text="No subscriptions match this filter." />
      ) : (
        <>
          <ul className="divide-y divide-[#EDF1EE] min-[1440px]:hidden">
            {items.map((item) => (
              <SubscriptionCard key={item.id} item={item} onAction={onAction} />
            ))}
          </ul>
          <table className="hidden w-full table-fixed text-left text-sm min-[1440px]:table">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[19%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="border-b border-[#E8EEE9] bg-[#F8FAF8] text-xs font-semibold text-[#66736A]">
              <tr>
                <th className="px-5 py-3">Organization</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Period end</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1EE]">
              {items.map((item) => (
                <SubscriptionRow
                  key={item.id}
                  item={item}
                  onAction={onAction}
                />
              ))}
            </tbody>
          </table>
          <PaginationControls
            pagination={pagination}
            onPrevious={onPrevious}
            onNext={onNext}
            countLabel="records"
          />
        </>
      )}
    </div>
  );
}

function SubscriptionCard({ item, onAction }) {
  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#25352B]">
            {item.organizationName}
          </p>
          <p className="mt-1 truncate text-xs text-[#748177]">
            {item.ownerEmail}
          </p>
        </div>
        <StatusBadge value={item.status} />
      </div>
      {item.operationalWarning ? (
        <p className="mt-3 text-xs text-[#8A5C16]">{item.operationalWarning}</p>
      ) : null}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <Detail label="Plan" value={item.planDisplayName || item.planCode} />
        <Detail label="Period end" value={formatDate(item.currentPeriodEnd)} />
      </dl>
      <ActionButtons item={item} onAction={onAction} />
    </li>
  );
}

function SubscriptionRow({ item, onAction }) {
  return (
    <tr className="align-top hover:bg-[#FAFCFA]">
      <td className="px-5 py-4 font-semibold text-[#25352B]">
        <span className="block truncate" title={item.organizationName}>
          {item.organizationName}
        </span>
        {item.operationalWarning ? (
          <span className="mt-1 block break-words text-xs font-normal text-[#8A5C16]">
            {item.operationalWarning}
          </span>
        ) : null}
      </td>
      <td className="px-4 py-4 text-[#65736A]">
        <span className="block truncate" title={item.ownerEmail}>
          {item.ownerEmail}
        </span>
      </td>
      <td className="px-4 py-4 capitalize text-[#435248]">
        <span className="block break-words leading-5" title={item.planDisplayName || item.planCode}>
          {item.planDisplayName || item.planCode}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="min-w-0">
          <StatusBadge value={item.status} wrap />
        </div>
      </td>
      <td className="px-4 py-4 text-[#65736A]">
        {formatDate(item.currentPeriodEnd)}
      </td>
      <td className="px-4 py-3">
        <ActionButtons item={item} onAction={onAction} compact />
      </td>
    </tr>
  );
}

function ActionButtons({ item, onAction, compact = false }) {
  return (
    <div
      className={`mt-4 flex flex-wrap gap-2 ${
        compact ? "mt-0 flex-col items-stretch" : ""
      }`}
    >
      <Button
        variant="secondary"
        size="sm"
        className={compact ? "w-full whitespace-nowrap" : ""}
        onClick={() => onAction("extend_trial", item)}
      >
        Extend trial
      </Button>
      {item.status === "suspended" ? (
        <Button
          size="sm"
          className={compact ? "w-full whitespace-nowrap" : ""}
          onClick={() => onAction("reactivate", item)}
        >
          Reactivate
        </Button>
      ) : (
        <Button
          variant="danger"
          size="sm"
          className={compact ? "w-full whitespace-nowrap" : ""}
          onClick={() => onAction("suspend", item)}
        >
          Suspend
        </Button>
      )}
    </div>
  );
}

function CheckoutsPanel({
  items,
  loading,
  pagination,
  onPrevious,
  onNext,
  onAction,
}) {
  return (
    <div>
      {loading ? (
        <LoadingBlock />
      ) : !items.length ? (
        <EmptyBlock text="No checkout sessions are available." />
      ) : (
        <>
          <ul className="divide-y divide-[#EDF1EE] min-[1440px]:hidden">
            {items.map((item) => (
              <CheckoutCard key={item.id} item={item} onAction={onAction} />
            ))}
          </ul>
          <table className="hidden w-full table-fixed text-left text-sm min-[1440px]:table">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[13%]" />
              <col className="w-[22%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="border-b border-[#E8EEE9] bg-[#F8FAF8] text-xs font-semibold text-[#66736A]">
              <tr>
                <th className="px-5 py-3">Session</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1EE]">
              {items.map((item) => (
                <CheckoutRow key={item.id} item={item} onAction={onAction} />
              ))}
            </tbody>
          </table>
          <PaginationControls
            pagination={pagination}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </>
      )}
    </div>
  );
}

function CheckoutCard({ item, onAction }) {
  const canRetry =
    item.paymentConfirmedAt && item.emailVerifiedAt && item.status !== "active";
  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#25352B]">
            {item.organizationName}
          </p>
          <p className="mt-1 truncate text-xs text-[#748177]">
            {item.ownerEmail}
          </p>
        </div>
        <StatusBadge value={item.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <Detail label="Session" value={item.id} mono />
        <Detail
          label="Payment"
          value={
            item.paymentConfirmedAt
              ? formatDate(item.paymentConfirmedAt, {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Unpaid"
          }
        />
      </dl>
      {canRetry ? (
        <div className="mt-4">
          <Button
            size="sm"
            disabled={item.status === "provisioning"}
            onClick={() => onAction("retry_provisioning", item)}
          >
            {item.status === "provisioning" ? "Setup running" : "Retry setup"}
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-xs text-[#748177]">
          {!item.paymentConfirmedAt
            ? "Awaiting payment"
            : !item.emailVerifiedAt
              ? "Awaiting email verification"
              : "Setup complete"}
        </p>
      )}
    </li>
  );
}

function CheckoutRow({ item, onAction }) {
  const canRetry =
    item.paymentConfirmedAt && item.emailVerifiedAt && item.status !== "active";
  const payment = item.paymentConfirmedAt
    ? formatDate(item.paymentConfirmedAt, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unpaid";
  return (
    <tr className="align-top hover:bg-[#FAFCFA]">
      <td className="px-5 py-4 font-mono text-xs font-semibold text-[#25352B]">
        <span className="block truncate" title={item.id}>
          {item.id}
        </span>
      </td>
      <td className="px-4 py-4 font-mono text-xs text-[#65736A]">
        <span className="block truncate" title={item.publicTokenMasked}>
          {item.publicTokenMasked}
        </span>
      </td>
      <td className="px-4 py-4">
        <p className="truncate font-semibold text-[#25352B]">
          {item.organizationName}
        </p>
        <p className="mt-1 truncate text-xs text-[#748177]">
          {item.ownerEmail}
        </p>
      </td>
      <td className="px-4 py-4">
        <div className="min-w-0">
          <StatusBadge value={item.status} wrap />
        </div>
      </td>
      <td className="px-4 py-4 text-[#65736A]">
        <span className="block truncate" title={payment}>
          {payment}
        </span>
      </td>
      <td className="px-4 py-4">
        {canRetry ? (
          <Button
            size="sm"
            disabled={item.status === "provisioning"}
            onClick={() => onAction("retry_provisioning", item)}
          >
            {item.status === "provisioning" ? "Running" : "Retry setup"}
          </Button>
        ) : (
          <span className="text-xs text-[#748177]">
            {!item.paymentConfirmedAt
              ? "Unpaid"
              : !item.emailVerifiedAt
                ? "Unverified"
                : "Complete"}
          </span>
        )}
      </td>
    </tr>
  );
}

function WebhooksPanel({
  items,
  loading,
  pagination,
  onPrevious,
  onNext,
  onAction,
}) {
  return (
    <div>
      {loading ? (
        <LoadingBlock />
      ) : !items.length ? (
        <EmptyBlock text="No webhook events are available." />
      ) : (
        <>
          <ul className="divide-y divide-[#EDF1EE] min-[1440px]:hidden">
            {items.map((item) => (
              <WebhookCard key={item.id} item={item} onAction={onAction} />
            ))}
          </ul>
          <table className="hidden w-full table-fixed text-left text-sm min-[1440px]:table">
            <colgroup>
              <col className="w-[17%]" />
              <col className="w-[19%]" />
              <col className="w-[15%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[13%]" />
            </colgroup>
            <thead className="border-b border-[#E8EEE9] bg-[#F8FAF8] text-xs font-semibold text-[#66736A]">
              <tr>
                <th className="px-5 py-3">Provider event</th>
                <th className="px-4 py-3">Event type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Error summary</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1EE]">
              {items.map((item) => (
                <WebhookRow key={item.id} item={item} onAction={onAction} />
              ))}
            </tbody>
          </table>
          <PaginationControls
            pagination={pagination}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </>
      )}
    </div>
  );
}

function WebhookCard({ item, onAction }) {
  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-semibold text-[#25352B]">
            {item.providerEventId}
          </p>
          <p className="mt-1 truncate text-xs text-[#748177]">
            {item.eventType}
          </p>
        </div>
        <StatusBadge value={item.processingStatus} />
      </div>
      <dl className="mt-3 grid gap-2 text-xs">
        <Detail
          label="Received"
          value={formatDate(item.receivedAt, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
        <Detail label="Error" value={item.errorSummary || "None"} />
      </dl>
      {item.processingStatus === "failed" ? (
        <div className="mt-4">
          <Button size="sm" onClick={() => onAction("reprocess_webhook", item)}>
            Reprocess
          </Button>
        </div>
      ) : null}
    </li>
  );
}

function WebhookRow({ item, onAction }) {
  return (
    <tr className="align-top hover:bg-[#FAFCFA]">
      <td className="px-5 py-4 font-mono text-xs font-semibold text-[#25352B]">
        <span className="block truncate" title={item.providerEventId}>
          {item.providerEventId}
        </span>
      </td>
      <td className="px-4 py-4 font-mono text-xs text-[#435248]">
        <span className="block truncate" title={item.eventType}>
          {item.eventType}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="min-w-0">
          <StatusBadge value={item.processingStatus} wrap />
        </div>
      </td>
      <td className="px-4 py-4 text-[#65736A]">
        {formatDate(item.receivedAt, { hour: "2-digit", minute: "2-digit" })}
      </td>
      <td className="px-4 py-4 font-mono text-xs text-[#8A3028]">
        <span className="block truncate" title={item.errorSummary || "—"}>
          {item.errorSummary || "—"}
        </span>
      </td>
      <td className="px-4 py-4">
        {item.processingStatus === "failed" ? (
          <Button size="sm" onClick={() => onAction("reprocess_webhook", item)}>
            Reprocess
          </Button>
        ) : (
          <span className="text-xs text-[#748177]">Processed</span>
        )}
      </td>
    </tr>
  );
}

function Detail({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <dt className="text-[#748177]">{label}</dt>
      <dd
        className={`mt-0.5 truncate font-medium text-[#435248] ${
          mono ? "font-mono text-[11px]" : ""
        }`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
