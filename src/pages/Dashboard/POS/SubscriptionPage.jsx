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

export default function SubscriptionPage() {
  const { organizationId } = useParams();
  const resource = usePosResource(
    () => posPlatformApi.getOrganization(organizationId),
    [organizationId],
  );
  const plansResource = usePosResource(() => posPlatformApi.listPlans(), []);
  const organization = organizationFrom(resource.data);
  const [form, setForm] = useState({ planCode: "", status: "" });
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
    setForm((current) => ({
      planCode: current.planCode || String(plan || "").toLowerCase(),
      status: current.status || String(status || "").toLowerCase(),
    }));
  }, [organization, plan, status]);

  if (resource.loading || plansResource.loading) return <LoadingPanel />;
  if (resource.error)
    return <ErrorPanel error={resource.error} onRetry={resource.refresh} />;
  if (plansResource.error) {
    return (
      <ErrorPanel error={plansResource.error} onRetry={plansResource.refresh} />
    );
  }

  const name = organizationName(organization);
  const selectedPlan = plans.find((item) => item.code === form.planCode);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      await posPlatformApi.updateSubscription(organizationId, form);
      setConfirming(false);
      setMessage({
        type: "success",
        text: "Subscription updated successfully. Ask the owner to refresh POS (or sign out/in) to reload modules.",
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
            ← Back to organization
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
      <div className="max-w-2xl rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
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
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Button type="submit" disabled={!form.planCode || !form.status}>
            Review change
          </Button>
        </form>
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
          ?
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
