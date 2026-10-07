import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import { AdminError, AdminLoading } from "../../../components/admin/AdminUi";
import { PageHeader, StatusBadge } from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import { platformAdminApi } from "../../../services/platformAdminApi";

const initialForm = {
  kind: "company",
  status: "prospect",
  legalName: "",
  displayName: "",
  primaryEmail: "",
  primaryPhone: "",
  industry: "",
  currency: "PHP",
  timezone: "Asia/Manila",
};

function AccountRegistrationBadge({ client }) {
  const account = client.client_auth_account;
  if (!account) {
    return (
      <StatusBadge
        value="No website account"
        tone="bg-[#4C4239]/10 text-[#4C4239] ring-[#4C4239]/15"
      />
    );
  }
  return (
    <StatusBadge
      value={account.email_confirmed_at ? "Email verified" : "Email pending"}
      tone={
        account.email_confirmed_at
          ? "bg-[#386F55]/10 text-[#1A593B] ring-[#386F55]/20"
          : "bg-amber-50 text-amber-800 ring-amber-200"
      }
    />
  );
}

export default function ClientsPage() {
  const navigate = useNavigate();
  const resource = usePosResource(platformAdminApi.listClients, []);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);

  async function create(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const client = await platformAdminApi.createClient(form);
      setCreating(false);
      navigate(`/admin/clients/${client.id}`);
    } catch (requestError) {
      setError({
        text: requestError.message,
        existingClient:
          requestError.code === "CLIENT_EMAIL_EXISTS"
            ? requestError.details?.client || null
            : null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Clients"
        description="Manage every registered client account and the Ximo services assigned to each one."
        actions={<Button onClick={() => setCreating(true)}>Add client</Button>}
      />
      {resource.loading ? (
        <AdminLoading />
      ) : resource.error ? (
        <AdminError error={resource.error} retry={resource.refresh} />
      ) : (
        <div className="portal-surface">
          <div className="flex items-center justify-between gap-3 border-b border-[#1A593B]/10 px-4 py-4 sm:px-6 sm:py-5">
            <div>
              <h2 className="portal-section-heading">Client records</h2>
              <p className="portal-supporting-copy mt-1">
                Website registrations appear here before they subscribe or activate a Ximo system.
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-[#1A593B]">
              {resource.data?.length || 0} total
            </p>
          </div>
          <div className="divide-y divide-[#1A593B]/10 md:hidden">
            {resource.data?.map((client) => (
              <Link
                key={client.id}
                to={`/admin/clients/${client.id}`}
                className="portal-list-row flex items-center gap-3"
              >
                <ClientAvatar name={client.display_name || client.legal_name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#25352B]">
                    {client.display_name || client.legal_name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#748177]">
                    {client.kind} · {client.client_systems?.length || 0} system
                    {(client.client_systems?.length || 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge value={client.status} />
                  <AccountRegistrationBadge client={client} />
                </span>
              </Link>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-[#E7ECE7]">
              <thead className="bg-[#F8F9FA]">
                <tr>
                  {[
                    "Client",
                    "Type",
                    "Status",
                    "Systems",
                    "Contact",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-[#758176]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF0ED]">
                {resource.data?.map((client) => (
                  <tr
                    key={client.id}
                    className="transition-colors hover:bg-[#F8FAF8]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#17241C]">
                        {client.display_name || client.legal_name}
                      </p>
                      <p className="mt-1 text-xs text-[#879187]">
                        {client.legal_name}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-[#59645C]">
                      {client.kind}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge value={client.status} />
                        <AccountRegistrationBadge client={client} />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#39443D]">
                      {client.client_systems?.length || 0}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#59645C]">
                      {client.primary_email || client.primary_phone || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        className="text-sm font-semibold text-primary transition hover:text-[#17241C]"
                        to={`/admin/clients/${client.id}`}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!resource.data?.length && (
            <div className="p-8 text-center sm:p-12">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#17241C]">
                No client records yet.
              </p>
              <p className="mt-2 text-sm text-[#68736A]">
                Add the first client to begin connecting Ximo systems.
              </p>
            </div>
          )}
        </div>
      )}
      <Modal
        isOpen={creating}
        onClose={() => !saving && setCreating(false)}
        title="Add client"
      >
        <form onSubmit={create} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-button bg-red-50 p-3 text-sm text-red-800"
            >
              <p>{error.text}</p>
              {error.existingClient?.id && (
                <Link
                  to={`/admin/clients/${error.existingClient.id}`}
                  onClick={() => setCreating(false)}
                  className="mt-2 inline-flex font-semibold text-primary underline underline-offset-4"
                >
                  Open existing client
                </Link>
              )}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Legal name"
              required
              value={form.legalName}
              onChange={(value) => setForm({ ...form, legalName: value })}
            />
            <Field
              label="Display name"
              value={form.displayName}
              onChange={(value) => setForm({ ...form, displayName: value })}
            />
            <SelectField
              label="Client type"
              value={form.kind}
              options={["company", "individual"]}
              onChange={(value) => setForm({ ...form, kind: value })}
            />
            <SelectField
              label="Status"
              value={form.status}
              options={["prospect", "active", "inactive"]}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <Field
              label="Email"
              type="email"
              value={form.primaryEmail}
              onChange={(value) => setForm({ ...form, primaryEmail: value })}
            />
            <Field
              label="Phone"
              value={form.primaryPhone}
              onChange={(value) => setForm({ ...form, primaryPhone: value })}
            />
            <Field
              label="Industry"
              value={form.industry}
              onChange={(value) => setForm({ ...form, industry: value })}
            />
            <Field
              label="Currency"
              required
              maxLength={3}
              value={form.currency}
              onChange={(value) => setForm({ ...form, currency: value })}
            />
          </div>
          <Field
            label="Timezone"
            required
            value={form.timezone}
            onChange={(value) => setForm({ ...form, timezone: value })}
          />
          <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => setCreating(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create client
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function ClientAvatar({ name }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF2EE] text-sm font-semibold text-[#1A593B]">
      {String(name || "C")
        .slice(0, 1)
        .toUpperCase()}
    </span>
  );
}

function Field({ label, onChange, ...props }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-button border border-neutral-300 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-button border border-neutral-300 bg-white px-3 py-2.5"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
