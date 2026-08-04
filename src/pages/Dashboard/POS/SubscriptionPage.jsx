import { useState } from "react";
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
import { posPlatformApi } from "../../../services/posPlatformApi";
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
  const organization = organizationFrom(resource.data);
  const [form, setForm] = useState({ planCode: "", status: "" });
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (resource.loading) return <LoadingPanel />;
  if (resource.error)
    return <ErrorPanel error={resource.error} onRetry={resource.refresh} />;
  const name = organizationName(organization);
  const plan = organizationPlan(organization);
  const status = organizationStatus(organization);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      await posPlatformApi.updateSubscription(organizationId, form);
      setConfirming(false);
      setMessage({
        type: "success",
        text: "Subscription updated successfully.",
      });
      await resource.refresh();
      setForm({ planCode: "", status: "" });
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
              Plan code
            </label>
            <input
              id="planCode"
              required
              value={form.planCode}
              onChange={(event) =>
                setForm({ ...form, planCode: event.target.value })
              }
              placeholder="business"
              className="w-full rounded-button border border-neutral-300 px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
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
            {form.planCode} / {form.status}
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
