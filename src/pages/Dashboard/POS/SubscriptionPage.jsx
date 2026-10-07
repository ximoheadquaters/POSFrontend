import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import {
  Breadcrumbs,
  ErrorPanel,
  LoadingPanel,
  PageHeader,
  StatusBadge,
} from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import {
  posPlatformApi,
  unwrapCollection,
} from "../../../services/posPlatformApi";
import {
  organizationFrom,
  organizationName,
  organizationPlan,
  organizationStatus,
} from "./posModels";
import { platformAdminApi } from "../../../services/platformAdminApi";

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function toIsoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function accessEndFrom(organization) {
  return (
    organization?.currentPeriodEndsAt ??
    organization?.current_period_ends_at ??
    null
  );
}

function clientSystemStatus(subscriptionStatus) {
  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    return "active";
  }
  return subscriptionStatus === "cancelled" ? "cancelled" : "suspended";
}

export default function SubscriptionPage() {
  const { organizationId } = useParams();
  const resource = usePosResource(
    () => posPlatformApi.getOrganization(organizationId),
    [organizationId],
  );
  const plansResource = usePosResource(() => posPlatformApi.listPlans(), []);
  const organization = organizationFrom(resource.data);
  const [form, setForm] = useState({
    planCode: "",
    status: "",
    currentPeriodEndsAt: "",
  });
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const plan = organizationPlan(organization);
  const status = organizationStatus(organization);
  const plans = unwrapCollection(plansResource.data, ["plans"]).filter(
    (item) => item.isActive !== false,
  );

  useEffect(() => {
    if (!organization) return;
    setForm({
      planCode: String(plan || "").toLowerCase(),
      status: String(status || "").toLowerCase(),
      currentPeriodEndsAt: toDateTimeLocal(accessEndFrom(organization)),
    });
  }, [organization, plan, status]);

  if (resource.loading || plansResource.loading) return <LoadingPanel />;
  if (resource.error || plansResource.error) {
    return (
      <div className="space-y-6">
        <Breadcrumbs organization="Organization not found" />
        <ErrorPanel
          error={resource.error || plansResource.error}
          onRetry={() => {
            if (resource.error) resource.refresh();
            if (plansResource.error) plansResource.refresh();
          }}
        />
        <div>
          <Link
            to="/admin/systems/pos"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
          >
            ← Back to POS Organizations
          </Link>
        </div>
      </div>
    );
  }

  const name = organizationName(organization);
  const selectedPlan = plans.find((item) => item.code === form.planCode);
  const selectedModules = Array.isArray(selectedPlan?.modules)
    ? [...selectedPlan.modules].sort((a, b) =>
        String(a.name || a.code || "").localeCompare(String(b.name || b.code || "")),
      )
    : [];

  async function save() {
    const currentPeriodEndsAt = toIsoOrNull(form.currentPeriodEndsAt);
    if (form.currentPeriodEndsAt && !currentPeriodEndsAt) {
      setMessage({
        type: "error",
        text: "Enter a valid access end date and time, or leave it blank for no scheduled end date.",
      });
      setConfirming(false);
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await posPlatformApi.updateSubscription(organizationId, {
        planCode: form.planCode,
        status: form.status,
        currentPeriodEndsAt,
      });
      // The POS platform is the authority for access. The website directory
      // mirrors its state so platform admins can see grants at a glance.
      try {
        await platformAdminApi.syncSystemAccessByTenant(organizationId, {
          status: clientSystemStatus(form.status),
          activatedAt:
            form.status === "active" || form.status === "trialing"
              ? new Date().toISOString()
              : undefined,
          deactivatedAt:
            form.status === "active" || form.status === "trialing"
              ? null
              : new Date().toISOString(),
        });
      } catch {
        // A standalone POS organization may not yet be linked to a website
        // client. Its authoritative platform subscription was still updated.
      }
      setConfirming(false);
      setMessage({
        type: "success",
        text: currentPeriodEndsAt
          ? `Subscription updated. POS access is scheduled to end on ${new Date(currentPeriodEndsAt).toLocaleString()}. Ask the owner to refresh POS (or sign out/in) to reload access.`
          : "Subscription updated with no scheduled access end. Ask the owner to refresh POS (or sign out/in) to reload access.",
      });
      await resource.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Breadcrumbs organization={name} />
      <PageHeader
        title="Subscription plan management"
        description={`Change the plan and subscription state for ${name}.`}
        actions={
          <Link
            className="text-sm font-semibold text-primary"
            to={`/admin/systems/pos/organizations/${organizationId}`}
          >
            Back to organization
          </Link>
        }
      />
      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`mb-5 rounded-card border p-4 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-[#E2E6EB] bg-[#F3F5F6] text-[#596273]"}`}
        >
          {message.text}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <div className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-neutral-100 pb-6">
            <span className="font-medium capitalize">{plan}</span>
            <StatusBadge value={status} />
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setConfirming(true);
            }}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="planCode"
                className="mb-1.5 block text-sm font-medium"
              >
                Plan
              </label>
              <select
                id="planCode"
                required
                value={form.planCode}
                onChange={(event) =>
                  setForm({ ...form, planCode: event.target.value })
                }
                className="w-full rounded-button border border-neutral-300 bg-white px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a plan</option>
                {plans.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name || item.code}
                    {item.priceMonthly ? ` — ${item.priceMonthly}/month` : ""}
                  </option>
                ))}
              </select>
              {selectedPlan?.description ? (
                <p className="mt-2 text-xs text-neutral-500">
                  {selectedPlan.description}
                </p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-sm font-medium"
              >
                Subscription status
              </label>
              <select
                id="status"
                required
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
                className="w-full rounded-button border border-neutral-300 bg-white px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a status</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past due</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="currentPeriodEndsAt"
                className="mb-1.5 block text-sm font-medium"
              >
                Access ends on <span className="font-normal text-neutral-500">(optional)</span>
              </label>
              <input
                id="currentPeriodEndsAt"
                type="datetime-local"
                value={form.currentPeriodEndsAt}
                onChange={(event) =>
                  setForm({ ...form, currentPeriodEndsAt: event.target.value })
                }
                className="w-full rounded-button border border-neutral-300 bg-white px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                Set the date and time when this POS grant should end. Leave it blank only when the access should not have a scheduled end.
              </p>
            </div>
            <Button type="submit" disabled={!form.planCode || !form.status}>
              Review change
            </Button>
          </form>
        </div>

        <aside className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="border-b border-neutral-100 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#929AA5]">
              Included modules
            </p>
            <h2 className="mt-1 text-base font-semibold text-[#252B3A]">
              {selectedPlan?.name || "Select a plan"}
            </h2>
          <p className="mt-1 text-xs text-[#7F8793]">
            Modules included with the selected plan.
          </p>
          <div className="mt-4 rounded-lg bg-[#F3F5F6] p-3 text-sm text-[#596273]">
            <p className="font-semibold text-[#303746]">POS access period</p>
            <p className="mt-1 text-xs leading-5">
              {form.currentPeriodEndsAt
                ? `Ends ${new Date(toIsoOrNull(form.currentPeriodEndsAt)).toLocaleString()}`
                : "No end date is scheduled."}
            </p>
          </div>
        </div>
          {selectedPlan ? (
            selectedModules.length ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#303746]">
                {selectedModules.map((module) => (
                  <li key={module.code || module.name}>
                    {module.name || module.code}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-[#7F8793]">
                No modules listed for this plan.
              </p>
            )
          ) : (
            <p className="mt-4 text-sm text-[#7F8793]">
              Choose a plan to see included modules.
            </p>
          )}
        </aside>
      </div>
      <Modal
        isOpen={confirming}
        onClose={() => !saving && setConfirming(false)}
        title="Confirm subscription change"
      >
        <p className="text-sm text-neutral-600">
          Change <strong>{name}</strong> from{" "}
          <strong className="capitalize">
            {plan} / {status}
          </strong>{" "}
          to{" "}
          <strong className="capitalize">
            {selectedPlan?.name || form.planCode} / {form.status}
          </strong>
          {form.currentPeriodEndsAt
            ? `, with access ending ${new Date(toIsoOrNull(form.currentPeriodEndsAt)).toLocaleString()}?`
            : ", with no scheduled access end?"}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setConfirming(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Confirm change
          </Button>
        </div>
      </Modal>
    </>
  );
}
