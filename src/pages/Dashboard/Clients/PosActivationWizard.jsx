import { useMemo, useState } from "react";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import usePosResource from "../../../hooks/usePosResource";
import {
  posPlatformApi,
  unwrapCollection,
  unwrapEntity,
} from "../../../services/posPlatformApi";

const PROFILES = [
  [
    "retail",
    "Retail",
    "Products, barcode sales, purchasing, and stock control.",
  ],
  [
    "food_service",
    "Food service",
    "Ingredients, recipes, prepared food, and production.",
  ],
  [
    "hybrid",
    "Hybrid",
    "Retail products and food-service workflows in one store.",
  ],
];

const outcomeFor = (value) =>
  value?.outcome || value?.recommendedAction || "ready_to_create";
const isRecovery = (outcome) =>
  outcome === "recovered_existing_workspace" || outcome === "recover_existing";
const isDone = (outcome) =>
  outcome === "already_assigned" ||
  outcome === "already_assigned_to_this_client";
const isBlocked = (outcome) =>
  outcome === "assigned_elsewhere" || outcome === "blocked";
const makeKey = () => `ximo-web-${crypto.randomUUID()}`;

function Notice({ message }) {
  if (!message) return null;
  return (
    <div
      role={message.type === "error" ? "alert" : "status"}
      className={`mb-4 rounded-xl border p-3 text-sm leading-5 ${message.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-[#DCE8E1] bg-[#F4F8F5] text-[#486052]"}`}
    >
      {message.text}
    </div>
  );
}

function Stepper({ step }) {
  return (
    <ol
      className="mb-5 grid grid-cols-3 gap-2"
      aria-label="POS activation progress"
    >
      {["Access", "Workspace", "Review"].map((label, index) => {
        const current = index + 1 === step;
        return (
          <li key={label}>
            <div
              className={`h-1 rounded-full ${index + 1 <= step ? "bg-primary" : "bg-[#E3EAE5]"}`}
            />
            <p
              className={`mt-2 text-xs font-semibold ${current ? "text-primary" : "text-[#7A877F]"}`}
            >
              {index + 1}. {label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function Field({ id, label, ...props }) {
  return (
    <label className="block text-sm font-medium text-[#26342A]" htmlFor={id}>
      {label}
      <input
        id={id}
        className="mt-1.5 min-h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      />
    </label>
  );
}

function Choice({ selected, title, description, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`rounded-xl border p-3.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${selected ? "border-primary bg-[#F2F8F4] ring-1 ring-primary" : "border-[#DCE5DF] bg-white hover:border-primary/50"}`}
    >
      <span className="block text-sm font-semibold text-[#1C2A20]">
        {title}
      </span>
      <span className="mt-1 block text-xs leading-5 text-[#637168]">
        {description}
      </span>
    </button>
  );
}

export default function PosActivationWizard({
  isOpen,
  onClose,
  clientId,
  client,
  onComplete,
}) {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [notice, setNotice] = useState(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [key, setKey] = useState(makeKey);
  const [values, setValues] = useState(() => initialValues(client));
  const plansResource = usePosResource(
    () => (isOpen ? posPlatformApi.listPlans() : Promise.resolve([])),
    [isOpen],
  );
  const plans = useMemo(
    () =>
      unwrapCollection(plansResource.data, ["plans"]).filter(
        (plan) =>
          plan.isAvailableForOnboarding !== false && plan.isActive !== false,
      ),
    [plansResource.data],
  );
  const plan = plans.find((item) => item.code === values.planCode);
  const allowedStatuses = plan?.allowedOnboardingStatuses || [
    "trialing",
    "active",
  ];
  const outcome = outcomeFor(preview);

  function reset() {
    setStep(1);
    setPreview(null);
    setNotice(null);
    setKey(makeKey());
    setValues(initialValues(client));
  }
  function close() {
    if (!checking && !saving) {
      reset();
      onClose();
    }
  }
  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function continueFromOwner() {
    if (!values.ownerName.trim() || !values.ownerEmail.trim()) {
      setNotice({
        type: "error",
        text: "Add the POS owner’s name and email before continuing.",
      });
      return;
    }
    setChecking(true);
    setNotice(null);
    try {
      const payload = await posPlatformApi.previewClientPosActivation(
        clientId,
        { ownerEmail: values.ownerEmail },
      );
      const result = unwrapEntity(payload, ["activation", "result"]);
      setPreview(result);
      const nextOutcome = outcomeFor(result);
      setStep(
        isRecovery(nextOutcome) || isDone(nextOutcome) || isBlocked(nextOutcome)
          ? 3
          : 2,
      );
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setChecking(false);
    }
  }

  function reviewWorkspace() {
    if (
      !values.name.trim() ||
      !values.businessProfile ||
      !values.planCode ||
      !values.subscriptionStatus
    ) {
      setNotice({
        type: "error",
        text: "Complete the workspace, business type, plan, and starting status before reviewing.",
      });
      return;
    }
    setNotice(null);
    setStep(3);
  }

  async function activate() {
    setSaving(true);
    setNotice(null);
    try {
      const payload = await posPlatformApi.activateClientPos(
        clientId,
        { provisioning: values },
        key,
      );
      const result = unwrapEntity(payload, ["activation", "result"]);
      const finalOutcome = outcomeFor(result);
      await onComplete({
        type: "success",
        text: isRecovery(finalOutcome)
          ? "The existing Ximo POS workspace is now assigned to this client."
          : finalOutcome === "created_with_existing_pos_account"
            ? "Ximo POS is assigned. The existing POS owner can sign in with their current credentials."
            : `Ximo POS is assigned. A setup link was sent to ${values.ownerEmail}.`,
      });
      reset();
      onClose();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Button
        variant="ghost"
        className="w-full sm:w-auto"
        disabled={checking || saving}
        onClick={() => {
          if (step === 1 || isDone(outcome) || isBlocked(outcome)) close();
          else {
            setNotice(null);
            setStep(step - 1);
          }
        }}
      >
        {step === 1 || isDone(outcome) || isBlocked(outcome)
          ? "Cancel"
          : "Back"}
      </Button>
      {step === 1 ? (
        <Button
          className="w-full sm:w-auto"
          loading={checking}
          disabled={saving}
          onClick={continueFromOwner}
        >
          Continue
        </Button>
      ) : null}
      {step === 2 ? (
        <Button className="w-full sm:w-auto" onClick={reviewWorkspace}>
          Review setup
        </Button>
      ) : null}
      {step === 3 && !isDone(outcome) && !isBlocked(outcome) ? (
        <Button
          className="w-full sm:w-auto"
          loading={saving}
          onClick={activate}
        >
          {isRecovery(outcome)
            ? "Assign existing POS"
            : "Create and assign POS"}
        </Button>
      ) : null}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Activate Ximo POS"
      footer={footer}
      className="max-w-xl"
    >
      <Stepper step={step} />
      <Notice message={notice} />
      {step === 1 ? <Access values={values} update={update} /> : null}
      {step === 2 ? (
        <Workspace
          values={values}
          update={update}
          plans={plans}
          plan={plan}
          statuses={allowedStatuses}
          loading={plansResource.loading}
          error={plansResource.error}
        />
      ) : null}
      {step === 3 ? (
        <Review values={values} preview={preview} plan={plan} />
      ) : null}
    </Modal>
  );
}
function Access({ values, update }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-base font-semibold text-[#17241C]">
          Confirm the POS owner
        </h4>
        <p className="mt-1 text-sm leading-5 text-neutral-500">
          We use this email to find an existing POS workspace before creating a
          new one.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="pos-owner-name"
          label="POS owner name"
          value={values.ownerName}
          onChange={(event) => update("ownerName", event.target.value)}
          required
        />
        <Field
          id="pos-owner-email"
          label="POS owner email"
          type="email"
          value={values.ownerEmail}
          onChange={(event) => update("ownerEmail", event.target.value)}
          required
        />
      </div>
      <div className="rounded-xl border border-[#DDE8E0] bg-[#F4F8F5] p-3 text-sm leading-5 text-[#486052]">
        A landing-page account alone does not create a POS workspace. If a POS
        workspace already uses this email, it is safely connected to this
        client. Otherwise, Ximo sends a secure setup link after activation.
      </div>
    </div>
  );
}

function Workspace({ values, update, plans, plan, statuses, loading, error }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-base font-semibold text-[#17241C]">
          Configure the workspace
        </h4>
        <p className="mt-1 text-sm leading-5 text-neutral-500">
          These choices determine the workflows and starting state available in
          Ximo POS.
        </p>
      </div>
      <Field
        id="pos-business-name"
        label="Business name"
        value={values.name}
        onChange={(event) => update("name", event.target.value)}
        required
      />
      <fieldset>
        <legend className="text-sm font-medium text-[#26342A]">
          Business type
        </legend>
        <div
          className="mt-2 grid gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Business type"
        >
          {PROFILES.map(([value, title, description]) => (
            <Choice
              key={value}
              selected={values.businessProfile === value}
              title={title}
              description={description}
              onClick={() => update("businessProfile", value)}
            />
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="pos-currency"
          label="Currency"
          value={values.currency}
          maxLength={3}
          onChange={(event) =>
            update("currency", event.target.value.toUpperCase())
          }
          required
        />
        <Field
          id="pos-timezone"
          label="Timezone"
          value={values.timezone}
          onChange={(event) => update("timezone", event.target.value)}
          required
        />
      </div>
      {loading ? (
        <p className="text-sm text-neutral-500">Loading subscription plans…</p>
      ) : error ? (
        <Notice message={{ type: "error", text: error.message }} />
      ) : (
        <>
          <label
            className="block text-sm font-medium text-[#26342A]"
            htmlFor="pos-plan"
          >
            Subscription plan
            <select
              id="pos-plan"
              value={values.planCode}
              onChange={(event) => {
                const selected = plans.find(
                  (item) => item.code === event.target.value,
                );
                update("planCode", event.target.value);
                update(
                  "subscriptionStatus",
                  selected?.allowedOnboardingStatuses?.[0] || "trialing",
                );
              }}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">Select a plan</option>
              {plans.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                  {item.priceMonthly ? ` — ${item.priceMonthly}/month` : ""}
                </option>
              ))}
            </select>
          </label>
          {plan ? (
            <details className="rounded-xl border border-[#DFE8E2] bg-[#FAFCFB] px-3 py-2.5">
              <summary className="cursor-pointer text-sm font-semibold text-[#315241]">
                Included workflows ({plan.modules?.length || 0})
              </summary>
              <p className="mt-2 text-xs leading-5 text-[#66736A]">
                {plan.modules?.map((module) => module.name).join(", ") ||
                  "No workflows are listed for this plan."}
              </p>
            </details>
          ) : null}
          <label
            className="block text-sm font-medium text-[#26342A]"
            htmlFor="pos-status"
          >
            Starting status
            <select
              id="pos-status"
              value={values.subscriptionStatus}
              onChange={(event) =>
                update("subscriptionStatus", event.target.value)
              }
              disabled={!values.planCode}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50"
              required
            >
              <option value="">Select a status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
    </div>
  );
}
function Review({ values, preview, plan }) {
  const outcome = outcomeFor(preview);
  const organization = preview?.organization || preview?.workspace || null;
  const recovery = isRecovery(outcome);
  const blocked = isBlocked(outcome);
  const alreadyAssigned = isDone(outcome);
  const workspaceName =
    organization?.name || organization?.businessName || values.name;
  const message = blocked
    ? "This POS workspace is already assigned to another client. Nothing can be changed here."
    : alreadyAssigned
      ? "This POS workspace is already assigned to this client. No second workspace will be created."
      : recovery
        ? "An existing POS workspace was found for this owner and can be safely assigned to this client."
        : "A new Ximo POS workspace will be created and assigned to this client.";
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-base font-semibold text-[#17241C]">
          {blocked
            ? "Workspace already belongs elsewhere"
            : alreadyAssigned
              ? "POS already active"
              : "Review activation"}
        </h4>
        <p className="mt-1 text-sm leading-5 text-neutral-500">{message}</p>
      </div>
      <div
        className={`rounded-xl border p-4 ${blocked ? "border-red-200 bg-red-50" : "border-[#DCE8E1] bg-[#FAFCFB]"}`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${blocked ? "text-red-700" : "text-[#668073]"}`}
        >
          {recovery || alreadyAssigned || blocked
            ? "Workspace"
            : "New workspace"}
        </p>
        <p
          className={`mt-1 font-semibold ${blocked ? "text-red-900" : "text-[#26342A]"}`}
        >
          {workspaceName || "Ximo POS"}
        </p>
        {organization?.id ? (
          <p
            className={`mt-1 break-all text-xs ${blocked ? "text-red-700" : "text-[#68766E]"}`}
          >
            {organization.id}
          </p>
        ) : null}
        {preview?.assignedClient?.displayName ||
        preview?.assignedClient?.legalName ? (
          <p className="mt-2 text-sm text-red-800">
            Assigned to{" "}
            {preview.assignedClient.displayName ||
              preview.assignedClient.legalName}
          </p>
        ) : null}
      </div>
      {!recovery && !alreadyAssigned && !blocked ? (
        <dl className="divide-y divide-[#E5ECE7] rounded-xl border border-[#E0E8E2] bg-white">
          <Row
            label="Owner"
            value={`${values.ownerName} · ${values.ownerEmail}`}
          />
          <Row
            label="Business type"
            value={
              PROFILES.find(
                (item) => item[0] === values.businessProfile,
              )?.[1] || "—"
            }
          />
          <Row label="Plan" value={plan?.name || values.planCode} />
          <Row
            label="Starting status"
            value={values.subscriptionStatus || "—"}
          />
        </dl>
      ) : null}
      {recovery ? (
        <div className="rounded-xl bg-[#F4F8F5] p-3 text-sm leading-5 text-[#486052]">
          This recovery only connects the existing workspace to this client. It
          does not create a duplicate organization or replace its owner.
        </div>
      ) : null}
      {alreadyAssigned ? (
        <div className="rounded-xl bg-[#F4F8F5] p-3 text-sm leading-5 text-[#486052]">
          No action is needed. Close this dialog to return to the client record.
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid gap-1 px-3 py-2.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#7A877F]">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm text-[#314038]">{value}</dd>
    </div>
  );
}

function initialValues(client) {
  return {
    name: client?.legal_name || client?.display_name || "",
    currency: client?.preferred_currency || "PHP",
    timezone: client?.timezone || "Asia/Manila",
    planCode: "",
    subscriptionStatus: "",
    businessProfile: "",
    ownerEmail: client?.primary_email || "",
    ownerName: client?.display_name || client?.legal_name || "",
  };
}
