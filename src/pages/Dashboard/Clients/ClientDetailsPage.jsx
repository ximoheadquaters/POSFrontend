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
import { posPlatformApi, unwrapEntity } from "../../../services/posPlatformApi";
import PosActivationWizard from "./PosActivationWizard";

function assignmentName(assignment) {
  return assignment.system_code === "pos"
    ? "Ximo POS"
    : assignment.systems?.name || assignment.system_code;
}

function SystemIcon({ code }) {
  const shared = {
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": true,
  };
  if (code === "pos")
    return (
      <svg {...shared} className="h-5 w-5">
        <rect x="4" y="3.5" width="16" height="17" rx="2" />
        <path strokeLinecap="round" d="M7.5 7.5h9M7.5 11h9M8 16h3M15 16h1" />
      </svg>
    );
  return (
    <svg {...shared} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 7.5 8-4 8 4-8 4-8-4Zm0 4.5 8 4 8-4m-16 4.5 8 4 8-4"
      />
    </svg>
  );
}

export default function ClientDetailsPage() {
  const { clientId } = useParams();
  const resource = usePosResource(
    () => platformAdminApi.getClient(clientId),
    [clientId],
  );
  const systemsResource = usePosResource(platformAdminApi.listSystems, []);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const [resendAssignment, setResendAssignment] = useState(null);
  const [resending, setResending] = useState(false);

  if (resource.loading) return <AdminLoading />;
  if (resource.error)
    return <AdminError error={resource.error} retry={resource.refresh} />;

  const client = resource.data;
  const name = client.display_name || client.legal_name;
  const assignments = client.client_systems || [];
  const hasPos = assignments.some(
    (assignment) => assignment.system_code === "pos",
  );

  async function openResendInvitation(assignment) {
    setMessage(null);
    setResending(true);
    try {
      const organization = unwrapEntity(
        await posPlatformApi.getOrganization(assignment.external_tenant_id),
        ["organization"],
      );
      setResendAssignment({
        ...assignment,
        resolvedOwnerEmail: organization?.owner?.email?.trim() || "",
        resolvedOwnerName: organization?.owner?.displayName || "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: `Could not load the POS owner email. ${error.message}`,
      });
    } finally {
      setResending(false);
    }
  }

  async function resendInvitation() {
    const email =
      resendAssignment?.resolvedOwnerEmail ||
      resendAssignment?.metadata?.ownerEmail ||
      client.primary_email;
    if (!email) {
      setMessage({
        type: "error",
        text: "No POS owner email is available to receive the setup link.",
      });
      setResendAssignment(null);
      return;
    }
    setResending(true);
    try {
      const payload = await posPlatformApi.resendOwnerInvitation(
        resendAssignment.external_tenant_id,
        email,
      );
      const result = unwrapEntity(payload, []);
      const sentTo = result?.sentTo || result?.owner?.email || email;
      if (resendAssignment?.id) {
        try {
          await platformAdminApi.updateSystemMetadata(resendAssignment.id, {
            ...(resendAssignment.metadata || {}),
            ownerEmail: sentTo,
            ownerName:
              resendAssignment.resolvedOwnerName ||
              resendAssignment.metadata?.ownerName ||
              null,
            invitationStatus: "pending",
          });
        } catch {
          /* Delivery succeeded; this metadata refresh is non-blocking. */
        }
      }
      setMessage({
        type: "success",
        text: `A POS setup link was sent to ${sentTo}.`,
      });
      setResendAssignment(null);
      await resource.refresh();
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
            Back to clients
          </Link>
        }
      />
      {message ? <Notice message={message} /> : null}
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
        <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-semibold">Assigned systems</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Products enabled for this client.
            </p>
          </div>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              setMessage(null);
              setAdding(true);
            }}
            disabled={hasPos || systemsResource.loading}
          >
            Add Ximo POS
          </Button>
        </div>
        {systemsResource.error ? (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-800 sm:px-6">
            The system catalog could not be loaded. The secure activation
            service will prepare it when you continue.{" "}
            {systemsResource.error.message}
          </div>
        ) : null}
        <div className="divide-y divide-neutral-100">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF2EE] text-primary">
                  <SystemIcon code={assignment.system_code} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#26342A]">
                      {assignmentName(assignment)}
                    </p>
                    <StatusBadge value={assignment.status} />
                  </div>
                  {assignment.external_tenant_id ? (
                    <p
                      className="mt-1 truncate text-xs text-[#68736A]"
                      title={assignment.external_tenant_id}
                    >
                      Workspace {assignment.external_tenant_id}
                    </p>
                  ) : null}
                </div>
              </div>
              {assignment.system_code === "pos" ? (
                <div className="mt-4 grid gap-2 border-t border-[#E7ECE8] pt-3 sm:flex sm:justify-end">
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    to={`/admin/systems/pos/organizations/${assignment.external_tenant_id}`}
                  >
                    Manage POS
                  </Link>
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#DCE8E1] bg-white px-3.5 text-sm font-semibold text-primary transition-colors hover:bg-[#F0F4F2] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => openResendInvitation(assignment)}
                    disabled={resending}
                  >
                    {resending ? "Preparing email…" : "Resend setup link"}
                  </button>
                </div>
              ) : null}
            </div>
          ))}
          {!assignments.length ? (
            <div className="px-5 py-8 text-sm text-neutral-500 sm:px-6">
              No systems are assigned yet. Activate Ximo POS when this client is
              ready to use it.
            </div>
          ) : null}
        </div>
      </section>
      <PosActivationWizard
        isOpen={adding}
        onClose={() => setAdding(false)}
        clientId={clientId}
        client={client}
        onComplete={async (nextMessage) => {
          setMessage(nextMessage);
          await resource.refresh();
        }}
      />
      <Modal
        isOpen={Boolean(resendAssignment)}
        onClose={() => !resending && setResendAssignment(null)}
        title="Resend POS setup link?"
      >
        <p className="text-sm leading-6 text-neutral-600">
          Send a new setup link to{" "}
          <strong>
            {resendAssignment?.resolvedOwnerEmail ||
              resendAssignment?.metadata?.ownerEmail ||
              "the POS owner"}
          </strong>
          ? Old setup links stop working after a resend.
        </p>
        {resendAssignment?.resolvedOwnerEmail &&
        client.primary_email &&
        resendAssignment.resolvedOwnerEmail.toLowerCase() !==
          client.primary_email.toLowerCase() ? (
          <div
            role="status"
            className="mt-4 rounded-button bg-amber-50 p-3 text-sm text-amber-900"
          >
            The client record uses <strong>{client.primary_email}</strong>,
            while the setup link will go to the POS owner above.
          </div>
        ) : null}
        {!resendAssignment?.resolvedOwnerEmail ? (
          <div
            role="alert"
            className="mt-4 rounded-button bg-red-50 p-3 text-sm text-red-800"
          >
            No POS owner email was found for this workspace. Check the workspace
            owner before resending.
          </div>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => setResendAssignment(null)}
            disabled={resending}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={resendInvitation}
            loading={resending}
            disabled={!resendAssignment?.resolvedOwnerEmail}
          >
            Resend link
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Notice({ message }) {
  return (
    <div
      role={message.type === "error" ? "alert" : "status"}
      className={`mb-5 rounded-card border p-4 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-[#DCE8E1] bg-[#F4F8F5] text-[#486052]"}`}
    >
      {message.text}
    </div>
  );
}
