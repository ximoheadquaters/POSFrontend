import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import {
  AdminBreadcrumbs,
  AdminError,
  AdminLoading,
} from "../../../components/admin/AdminUi";
import {
  InfoGrid,
  PageHeader,
  StatusBadge,
} from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import { platformAdminApi } from "../../../services/platformAdminApi";
import {
  posPlatformApi,
  unwrapCollection,
  unwrapEntity,
} from "../../../services/posPlatformApi";

function orgValue(org, ...keys) {
  return keys.map((key) => org?.[key]).find((value) => value != null);
}

function newProvisioningKey() {
  return `ximo-web-${crypto.randomUUID()}`;
}

const BUSINESS_PROFILES = [
  {
    value: "retail",
    label: "Retail",
    description: "Barcode sales, products, purchasing, and stock control.",
  },
  {
    value: "food_service",
    label: "Food service",
    description: "Ingredients, recipes, prepared food, and production.",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    description: "Retail products and food-service workflows in one POS.",
  },
];

export default function ClientDetailsPage() {
  const { clientId } = useParams();
  const resource = usePosResource(
    () => platformAdminApi.getClient(clientId),
    [clientId],
  );
  const systemsResource = usePosResource(platformAdminApi.listSystems, []);
  const [adding, setAdding] = useState(false);
  const [mode, setMode] = useState("create");
  const [systemCode, setSystemCode] = useState("pos");
  const [externalTenantId, setExternalTenantId] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(newProvisioningKey);
  const [provisioning, setProvisioning] = useState({
    name: "",
    currency: "PHP",
    timezone: "Asia/Manila",
    planCode: "",
    subscriptionStatus: "",
    businessProfile: "",
    ownerEmail: "",
    ownerName: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [resendAssignment, setResendAssignment] = useState(null);
  const [resending, setResending] = useState(false);
  const posOrganizations = usePosResource(
    () =>
      adding && mode === "link"
        ? posPlatformApi.listOrganizations()
        : Promise.resolve([]),
    [adding, mode],
  );
  const plansResource = usePosResource(
    () =>
      adding && mode === "create"
        ? posPlatformApi.listPlans()
        : Promise.resolve([]),
    [adding, mode],
  );

  if (resource.loading) return <AdminLoading />;
  if (resource.error)
    return <AdminError error={resource.error} retry={resource.refresh} />;
  const client = resource.data;
  const name = client.display_name || client.legal_name;
  const assignments = client.client_systems || [];
  const assignedCodes = new Set(assignments.map((item) => item.system_code));
  const availableSystems = (systemsResource.data || []).filter(
    (system) =>
      system.availability === "available" && !assignedCodes.has(system.code),
  );
  const organizations = unwrapCollection(posOrganizations.data, [
    "organizations",
  ]);
  const plans = unwrapCollection(plansResource.data, ["plans"]).filter(
    (plan) =>
      plan.isAvailableForOnboarding !== false && plan.isActive !== false,
  );
  const selectedPlan = plans.find(
    (plan) => plan.code === provisioning.planCode,
  );
  const allowedStatuses = selectedPlan?.allowedOnboardingStatuses || [
    "trialing",
    "active",
  ];

  function openAddSystem() {
    setMessage(null);
    setMode("create");
    setExternalTenantId("");
    setIdempotencyKey(newProvisioningKey());
    setProvisioning({
      name: client.legal_name,
      currency: client.preferred_currency || "PHP",
      timezone: client.timezone || "Asia/Manila",
      planCode: "",
      subscriptionStatus: "",
      businessProfile: "",
      ownerEmail: client.primary_email || "",
      ownerName: client.display_name || client.legal_name,
    });
    setAdding(true);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    let organizationId = externalTenantId;
    try {
      if (mode === "create") {
        const payload = await posPlatformApi.createOrganization(
          provisioning,
          idempotencyKey,
        );
        const organization = unwrapEntity(payload, ["organization"]);
        organizationId = orgValue(
          organization,
          "id",
          "organizationId",
          "organization_id",
        );
        if (!organizationId)
          throw new Error(
            "POS created the organization but did not return its ID.",
          );
        setExternalTenantId(organizationId);
      }
      await platformAdminApi.assignSystem(clientId, {
        systemCode,
        externalTenantId: organizationId,
        metadata:
          mode === "create"
            ? {
                ownerEmail: provisioning.ownerEmail,
                ownerName: provisioning.ownerName,
                businessProfile: provisioning.businessProfile,
                invitationStatus: "pending",
              }
            : {},
      });
      setAdding(false);
      setMessage({
        type: "success",
        text:
          mode === "create"
            ? "Ximo POS was created and assigned. The selected plan and business type now control its modules."
            : "Existing POS organization assigned successfully.",
      });
      await resource.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          organizationId && mode === "create"
            ? `${error.message} The POS organization ID is ${organizationId}; retrying will safely reuse it.`
            : error.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function resendInvitation() {
    const email =
      resendAssignment?.metadata?.ownerEmail || client.primary_email;
    setResending(true);
    setMessage(null);
    try {
      await posPlatformApi.resendOwnerInvitation(
        resendAssignment.external_tenant_id,
        email,
      );
      setResendAssignment(null);
      setMessage({
        type: "success",
        text: `A new POS owner verification email and temporary password were sent to ${email}.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setResendAssignment(null);
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <AdminBreadcrumbs
        items={[{ label: "Clients", to: "/admin/clients" }, { label: name }]}
      />
      <PageHeader
        title={name}
        description="Core client information and connected Ximo systems."
        actions={
          <Link
            className="text-sm font-semibold text-primary"
            to="/admin/clients"
          >
            ← Back to clients
          </Link>
        }
      />
      {message && !adding && <Notice message={message} />}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold">Client information</h2>
          <InfoGrid
            items={[
              { label: "Legal name", value: client.legal_name },
              { label: "Client type", value: client.kind },
              { label: "Industry", value: client.industry },
              { label: "Primary email", value: client.primary_email },
              { label: "Primary phone", value: client.primary_phone },
              {
                label: "Currency / timezone",
                value: `${client.preferred_currency} · ${client.timezone}`,
              },
            ]}
          />
        </section>
        <section className="rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Client status
          </p>
          <div className="mt-3">
            <StatusBadge value={client.status} />
          </div>
          <p className="mt-6 text-xs text-neutral-400">Client ID</p>
          <p className="mt-1 break-all text-xs text-neutral-600">{client.id}</p>
        </section>
      </div>
      <section className="mt-5 rounded-card border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">Assigned systems</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Products enabled for this client.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddSystem}
            disabled={!availableSystems.length}
          >
            Add system
          </Button>
        </div>
        <div className="divide-y divide-neutral-100">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-medium">
                  {assignment.systems?.name || assignment.system_code}
                </p>
                <p className="text-xs text-neutral-400">
                  External tenant: {assignment.external_tenant_id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge value={assignment.status} />
                {assignment.system_code === "pos" && (
                  <>
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary"
                      onClick={() => setResendAssignment(assignment)}
                    >
                      Resend owner email
                    </button>
                    <Link
                      className="text-sm font-semibold text-primary"
                      to={`/admin/systems/pos/organizations/${assignment.external_tenant_id}`}
                    >
                      Manage POS
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
          {!assignments.length && (
            <div className="p-10 text-center text-sm text-neutral-500">
              No systems assigned. Add Ximo POS to provision a new organization
              and its plan modules.
            </div>
          )}
        </div>
      </section>
      <Modal
        isOpen={adding}
        onClose={() => !saving && setAdding(false)}
        title="Add Ximo system"
      >
        <form onSubmit={submit} className="space-y-5">
          {message && <Notice message={message} />}
          <div>
            <label
              htmlFor="system"
              className="mb-1.5 block text-sm font-medium"
            >
              System
            </label>
            <select
              id="system"
              value={systemCode}
              onChange={(event) => setSystemCode(event.target.value)}
              className="w-full rounded-button border border-neutral-300 bg-white px-3 py-2.5"
            >
              {availableSystems.map((system) => (
                <option key={system.code} value={system.code}>
                  {system.name}
                </option>
              ))}
            </select>
          </div>
          <div
            className="grid grid-cols-2 gap-2 rounded-button bg-neutral-100 p-1"
            role="group"
            aria-label="POS onboarding method"
          >
            <button
              type="button"
              onClick={() => setMode("create")}
              className={`rounded-md px-3 py-2 text-sm font-medium ${mode === "create" ? "bg-white text-primary shadow-sm" : "text-neutral-500"}`}
            >
              Create new
            </button>
            <button
              type="button"
              onClick={() => setMode("link")}
              className={`rounded-md px-3 py-2 text-sm font-medium ${mode === "link" ? "bg-white text-primary shadow-sm" : "text-neutral-500"}`}
            >
              Link existing
            </button>
          </div>
          {mode === "create" ? (
            <ProvisioningFields
              values={provisioning}
              setValues={setProvisioning}
              plans={plans}
              plansResource={plansResource}
              selectedPlan={selectedPlan}
              allowedStatuses={allowedStatuses}
            />
          ) : (
            <ExistingOrganizationField
              resource={posOrganizations}
              organizations={organizations}
              value={externalTenantId}
              setValue={setExternalTenantId}
            />
          )}
          <div className="rounded-button bg-neutral-50 p-3 text-xs text-neutral-500">
            {mode === "create"
              ? "POS creates the organization, subscription, owner invitation, and default branch atomically. Available modules are the features included in both the selected plan and business type."
              : "Use this only when the client already has a POS organization."}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setAdding(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={
                mode === "create"
                  ? !provisioning.planCode ||
                    !provisioning.subscriptionStatus ||
                    !provisioning.businessProfile ||
                    !provisioning.ownerEmail ||
                    !provisioning.ownerName
                  : !externalTenantId
              }
            >
              {mode === "create"
                ? "Create and assign POS"
                : "Assign existing POS"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={Boolean(resendAssignment)}
        onClose={() => !resending && setResendAssignment(null)}
        title="Resend POS owner email?"
      >
        <p className="text-sm text-neutral-600">
          Send a new email-verification link and generated temporary password to{" "}
          <strong>
            {resendAssignment?.metadata?.ownerEmail ||
              client.primary_email ||
              "the client owner"}
          </strong>
          ? Previously issued verification links and temporary passwords will become invalid.
        </p>
        {!(resendAssignment?.metadata?.ownerEmail || client.primary_email) && (
          <div
            role="alert"
            className="mt-4 rounded-button bg-red-50 p-3 text-sm text-red-800"
          >
            Add a primary client email before resending the owner email.
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setResendAssignment(null)}
            disabled={resending}
          >
            Cancel
          </Button>
          <Button
            onClick={resendInvitation}
            loading={resending}
            disabled={
              !(resendAssignment?.metadata?.ownerEmail || client.primary_email)
            }
          >
            Resend link
          </Button>
        </div>
      </Modal>
    </>
  );
}

function ProvisioningFields({
  values,
  setValues,
  plans,
  plansResource,
  selectedPlan,
  allowedStatuses,
}) {
  const set = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));
  if (plansResource.loading)
    return (
      <p className="text-sm text-neutral-500">Loading subscription plans…</p>
    );
  if (plansResource.error)
    return (
      <div
        role="alert"
        className="rounded-button border border-red-200 bg-red-50 p-3 text-sm text-red-800"
      >
        {plansResource.error.message}
      </div>
    );
  return (
    <div className="space-y-4">
      <Input
        label="Business name"
        value={values.name}
        onChange={set("name")}
        required
      />
      <fieldset>
        <legend className="text-sm font-medium">Business type</legend>
        <p className="mt-1 text-xs text-neutral-500">
          Choose how this business operates. Ximo will activate the relevant
          workflows that are also included in its subscription plan.
        </p>
        <div
          className="mt-3 grid gap-3 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Business type"
        >
          {BUSINESS_PROFILES.map((profile) => {
            const selected = values.businessProfile === profile.value;
            return (
              <button
                key={profile.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    businessProfile: profile.value,
                  }))
                }
                className={`min-h-28 rounded-button border p-3 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-neutral-300 bg-white hover:border-primary/50"
                }`}
              >
                <span className="block text-sm font-semibold text-neutral-900">
                  {profile.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-neutral-500">
                  {profile.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Currency"
          value={values.currency}
          onChange={set("currency")}
          required
          maxLength={3}
        />
        <Input
          label="Timezone"
          value={values.timezone}
          onChange={set("timezone")}
          required
        />
      </div>
      <div>
        <label htmlFor="planCode" className="mb-1.5 block text-sm font-medium">
          Subscription plan
        </label>
        <select
          id="planCode"
          required
          value={values.planCode}
          onChange={(event) =>
            setValues((current) => {
              const plan = plans.find(
                (candidate) => candidate.code === event.target.value,
              );
              return {
                ...current,
                planCode: event.target.value,
                subscriptionStatus:
                  plan?.allowedOnboardingStatuses?.[0] || "active",
              };
            })
          }
          className="w-full rounded-button border border-neutral-300 bg-white px-3 py-2.5"
        >
          <option value="">Select a plan</option>
          {plans.map((plan) => (
            <option key={plan.code} value={plan.code}>
              {plan.name}
              {plan.priceMonthly ? ` — ${plan.priceMonthly}/month` : ""}
            </option>
          ))}
        </select>
      </div>
      {selectedPlan && (
        <div className="rounded-button border border-[#E2E6EB] bg-[#F7F8FA] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8B94A0]">
            Plan coverage
          </p>
          <p className="mt-1 text-sm text-[#596273]">
            {selectedPlan.modules?.map((module) => module.name).join(", ") ||
              "No modules listed"}
          </p>
          <p className="mt-2 text-xs text-[#8B94A0]">
            The selected business type filters this plan to the workflows that
            apply to the store.
          </p>
        </div>
      )}
      <div>
        <label
          htmlFor="subscriptionStatus"
          className="mb-1.5 block text-sm font-medium"
        >
          Starting status
        </label>
        <select
          id="subscriptionStatus"
          required
          disabled={!values.planCode}
          value={values.subscriptionStatus}
          onChange={set("subscriptionStatus")}
          className="w-full rounded-button border border-neutral-300 bg-white px-3 py-2.5"
        >
          <option value="">Select a status</option>
          {allowedStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Owner email"
        type="email"
        value={values.ownerEmail}
        onChange={set("ownerEmail")}
        required
      />
      <Input
        label="Owner name"
        value={values.ownerName}
        onChange={set("ownerName")}
        required
      />
    </div>
  );
}

function ExistingOrganizationField({
  resource,
  organizations,
  value,
  setValue,
}) {
  if (resource.loading)
    return <p className="text-sm text-neutral-500">Loading organizations…</p>;
  if (resource.error)
    return (
      <div
        role="alert"
        className="rounded-button border border-red-200 bg-red-50 p-3 text-sm text-red-800"
      >
        {resource.error.message}
      </div>
    );
  return (
    <div>
      <label
        htmlFor="organization"
        className="mb-1.5 block text-sm font-medium"
      >
        Existing POS organization
      </label>
      <select
        id="organization"
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-button border border-neutral-300 bg-white px-3 py-2.5"
      >
        <option value="">Select an organization</option>
        {organizations.map((org) => {
          const id = orgValue(org, "id", "organizationId", "organization_id");
          return (
            <option key={id} value={id}>
              {orgValue(org, "businessName", "business_name", "name") || id}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function Input({ label, ...props }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-button border border-neutral-300 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      />
    </div>
  );
}

function Notice({ message }) {
  return (
    <div
      role={message.type === "error" ? "alert" : "status"}
      className={`rounded-card border p-4 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-[#E2E6EB] bg-[#F3F5F6] text-[#596273]"}`}
    >
      {message.text}
    </div>
  );
}
