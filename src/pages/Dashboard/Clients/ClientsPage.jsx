import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import { AdminError } from "../../../components/admin/AdminUi";
import { PageHeader, StatusBadge } from "../../../components/pos/PosUi";
import usePosResource from "../../../hooks/usePosResource";
import { platformAdminApi } from "../../../services/platformAdminApi";
import PosActivationWizard from "./PosActivationWizard";

const ACCOUNT_TYPES = [
  {
    value: "company",
    label: "Company",
    description: "A business or organization account.",
  },
  {
    value: "individual",
    label: "Individual",
    description: "A single-person account.",
  },
  { value: "qa", label: "QA", description: "A Ximo-managed test account." },
];
const EMPTY_CLIENTS = [];

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

function accountTypeLabel(value) {
  return ACCOUNT_TYPES.find((type) => type.value === value)?.label || "Other";
}

function AccountTypeBadge({ value }) {
  const tone =
    {
      company: "bg-[#EAF2EE] text-[#1A593B] ring-[#C9DDCE]",
      individual: "bg-[#EEF1F5] text-[#435466] ring-[#D8E0E8]",
      qa: "bg-[#FFF5E6] text-[#875D17] ring-[#F1D3A0]",
    }[value] || "bg-[#F2F4F2] text-[#536158] ring-[#DDE4DE]";

  return (
    <span
      aria-label={`Account type: ${accountTypeLabel(value)}`}
      className={`inline-flex min-h-7 items-center rounded-lg px-2.5 text-[11px] font-semibold ring-1 ring-inset ${tone}`}
    >
      {accountTypeLabel(value)}
    </span>
  );
}

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
  const resource = usePosResource(platformAdminApi.listClients, []);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [accountType, setAccountType] = useState("all");
  const [status, setStatus] = useState("all");
  const [createdClient, setCreatedClient] = useState(null);
  const [activatingClient, setActivatingClient] = useState(null);

  const clients = resource.data ?? EMPTY_CLIENTS;
  const visibleClients = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return clients.filter((client) => {
      const matchesType = accountType === "all" || client.kind === accountType;
      const matchesStatus = status === "all" || client.status === status;
      const searchable = [
        client.display_name,
        client.legal_name,
        client.primary_email,
        client.primary_phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        matchesType &&
        matchesStatus &&
        (!keyword || searchable.includes(keyword))
      );
    });
  }, [accountType, clients, query, status]);
  const hasFilters = Boolean(
    query || accountType !== "all" || status !== "all",
  );

  function resetCreateForm() {
    setForm(initialForm);
    setError(null);
  }

  function openCreate() {
    resetCreateForm();
    setCreating(true);
  }

  function closeCreate() {
    if (saving) return;
    setCreating(false);
    resetCreateForm();
  }

  function clearFilters() {
    setQuery("");
    setAccountType("all");
    setStatus("all");
  }

  async function create(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const client = await platformAdminApi.createClient(form);
      await resource.refresh();
      setCreating(false);
      resetCreateForm();
      setCreatedClient(client);
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
        description="Create, review, and activate the client accounts managed by your team."
        actions={<Button onClick={openCreate}>Add client</Button>}
      />

      {resource.loading ? (
        <ClientDirectoryLoading />
      ) : resource.error ? (
        <AdminError error={resource.error} retry={resource.refresh} />
      ) : (
        <section
          className="portal-surface"
          aria-labelledby="client-directory-heading"
        >
          <div className="flex flex-col gap-4 border-b border-[#1A593B]/10 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2
                  id="client-directory-heading"
                  className="portal-section-heading"
                >
                  Client directory
                </h2>
                <p className="portal-supporting-copy mt-1 max-w-2xl">
                  Review account type, registration status, and POS access in
                  one place.
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-[#1A593B]">
                {visibleClients.length} of {clients.length}
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_auto]">
              <label className="relative block">
                <span className="sr-only">Search clients</span>
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718077]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="6.25" />
                  <path strokeLinecap="round" d="m16 16 4.25 4.25" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email, or phone"
                  className="w-full rounded-xl border border-[#D7E1D9] bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <SelectFilter
                label="Account type"
                value={accountType}
                onChange={setAccountType}
                options={[
                  ["all", "All account types"],
                  ...ACCOUNT_TYPES.map((type) => [type.value, type.label]),
                ]}
              />
              <SelectFilter
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  ["all", "All statuses"],
                  ["prospect", "Prospect"],
                  ["active", "Active"],
                  ["inactive", "Inactive"],
                ]}
              />
              {hasFilters ? (
                <Button
                  variant="ghost"
                  className="self-end"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              ) : (
                <span className="hidden lg:block" aria-hidden="true" />
              )}
            </div>
          </div>

          {clients.length === 0 ? (
            <ClientDirectoryEmpty onCreate={openCreate} />
          ) : visibleClients.length === 0 ? (
            <ClientDirectoryEmpty filtered onClear={clearFilters} />
          ) : (
            <>
              <div className="divide-y divide-[#E9EEEA] lg:hidden">
                {visibleClients.map((client) => (
                  <ClientMobileRow key={client.id} client={client} />
                ))}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table
                  className="w-full min-w-[900px] table-fixed"
                  aria-label="Client directory"
                >
                  <thead className="bg-[#F7F9F7]">
                    <tr>
                      <TableHeading className="w-[25%]">Client</TableHeading>
                      <TableHeading className="w-[12%]">
                        Account type
                      </TableHeading>
                      <TableHeading className="w-[22%]">
                        Account status
                      </TableHeading>
                      <TableHeading className="w-[10%]">
                        POS access
                      </TableHeading>
                      <TableHeading className="w-[21%]">Contact</TableHeading>
                      <TableHeading className="w-[10%] text-right">
                        Action
                      </TableHeading>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EEEA]">
                    {visibleClients.map((client) => (
                      <ClientTableRow key={client.id} client={client} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      <Modal
        isOpen={creating}
        onClose={closeCreate}
        title="Add client"
        className="max-w-2xl"
      >
        <form onSubmit={create} className="space-y-5">
          <p className="text-sm leading-5 text-[#66736A]">
            Create the client record first. POS activation is optional and can
            follow immediately.
          </p>
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800"
            >
              <p>{error.text}</p>
              {error.existingClient?.id ? (
                <Link
                  to={`/admin/clients/${error.existingClient.id}`}
                  onClick={closeCreate}
                  className="mt-2 inline-flex font-semibold underline underline-offset-4"
                >
                  Open existing client
                </Link>
              ) : null}
            </div>
          ) : null}
          <AccountTypeField
            value={form.kind}
            onChange={(value) => setForm({ ...form, kind: value })}
          />
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
              label="Status"
              value={form.status}
              options={[
                ["prospect", "Prospect"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ]}
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
            <Field
              label="Timezone"
              required
              value={form.timezone}
              onChange={(value) => setForm({ ...form, timezone: value })}
            />
          </div>
          <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#E7ECE8] pt-4 sm:flex-row sm:gap-3">
            <Button variant="ghost" onClick={closeCreate} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create client
            </Button>
          </div>
        </form>
      </Modal>

      <ActivationPrompt
        client={createdClient}
        onClose={() => setCreatedClient(null)}
        onActivate={() => {
          setActivatingClient(createdClient);
          setCreatedClient(null);
        }}
      />

      <PosActivationWizard
        isOpen={Boolean(activatingClient)}
        onClose={() => setActivatingClient(null)}
        clientId={activatingClient?.id}
        client={activatingClient}
        onComplete={async () => {
          await resource.refresh();
          setActivatingClient(null);
        }}
      />
    </>
  );
}

function TableHeading({ children, className = "" }) {
  return (
    <th
      className={`px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[#758176] ${className}`}
    >
      {children}
    </th>
  );
}

function ClientTableRow({ client }) {
  const systems = client.client_systems?.length || 0;
  return (
    <tr className="transition-colors hover:bg-[#F8FAF8]">
      <td className="px-5 py-4 align-top">
        <p className="truncate font-semibold text-[#17241C]">
          {client.display_name || client.legal_name}
        </p>
        {client.display_name && client.legal_name !== client.display_name ? (
          <p className="mt-1 truncate text-xs text-[#7B877F]">
            {client.legal_name}
          </p>
        ) : null}
      </td>
      <td className="px-5 py-4 align-top">
        <AccountTypeBadge value={client.kind} />
      </td>
      <td className="px-5 py-4 align-top">
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={client.status} />
          <AccountRegistrationBadge client={client} />
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        <span className="text-sm font-semibold tabular-nums text-[#334238]">
          {systems}
        </span>
        <span className="ml-1 text-xs text-[#778278]">
          {systems === 1 ? "system" : "systems"}
        </span>
      </td>
      <td className="px-5 py-4 align-top text-sm text-[#536158]">
        <p className="truncate">{client.primary_email || "—"}</p>
        {client.primary_phone ? (
          <p className="mt-1 truncate text-xs text-[#7B877F]">
            {client.primary_phone}
          </p>
        ) : null}
      </td>
      <td className="px-5 py-4 text-right align-top">
        <Link
          className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-primary transition hover:bg-[#EEF5F0]"
          to={`/admin/clients/${client.id}`}
        >
          View client
        </Link>
      </td>
    </tr>
  );
}

function ClientMobileRow({ client }) {
  const systems = client.client_systems?.length || 0;
  return (
    <article className="px-4 py-4 sm:px-5">
      <div className="flex gap-3">
        <ClientAvatar name={client.display_name || client.legal_name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-[#17241C]">
                {client.display_name || client.legal_name}
              </h3>
              <p className="mt-1 truncate text-xs text-[#778278]">
                {client.primary_email ||
                  client.primary_phone ||
                  "No contact details"}
              </p>
            </div>
            <AccountTypeBadge value={client.kind} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge value={client.status} />
            <AccountRegistrationBadge client={client} />
            <span className="text-xs text-[#6B776E]">
              {systems} {systems === 1 ? "system" : "systems"}
            </span>
          </div>
          <Link
            className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline"
            to={`/admin/clients/${client.id}`}
          >
            View client
          </Link>
        </div>
      </div>
    </article>
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

function ClientDirectoryLoading() {
  return (
    <section
      className="portal-surface"
      aria-label="Loading client directory"
      aria-busy="true"
    >
      <div className="flex items-center justify-between border-b border-[#E8EEEA] px-5 py-5 sm:px-6">
        <div className="animate-pulse space-y-2">
          <span className="block h-5 w-32 rounded bg-[#E9EFEB]" />
          <span className="block h-3 w-64 max-w-full rounded bg-[#F0F4F1]" />
        </div>
        <span className="h-4 w-12 animate-pulse rounded bg-[#E9EFEB]" />
      </div>
      <div className="animate-pulse divide-y divide-[#ECF0ED]">
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className="grid grid-cols-[1.8fr_1fr_1.25fr] gap-6 px-5 py-5 sm:px-6"
          >
            <span className="h-4 rounded bg-[#EEF3EF]" />
            <span className="h-4 rounded bg-[#F3F6F4]" />
            <span className="h-4 rounded bg-[#EEF3EF]" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading client records</span>
    </section>
  );
}

function ClientDirectoryEmpty({ filtered = false, onCreate, onClear }) {
  return (
    <div className="px-5 py-12 text-center sm:px-8 sm:py-16">
      <span
        className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#EAF2EE] text-[#1A593B]"
        aria-hidden="true"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="9" cy="8" r="3" />
          <path
            strokeLinecap="round"
            d="M3.5 19c.7-3.1 2.7-4.8 5.5-4.8 1.2 0 2.2.3 3.1.8M16.5 11.5v6m-3-3h6"
          />
        </svg>
      </span>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.025em] text-[#17241C]">
        {filtered ? "No clients match these filters" : "No client records yet"}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68756D]">
        {filtered
          ? "Try a different search or clear the current filters to see the full directory."
          : "Create a client record first, then activate POS whenever the account is ready."}
      </p>
      {filtered ? (
        <Button variant="secondary" className="mt-5" onClick={onClear}>
          Clear filters
        </Button>
      ) : (
        <Button className="mt-5" onClick={onCreate}>
          Add client
        </Button>
      )}
    </div>
  );
}

function ActivationPrompt({ client, onClose, onActivate }) {
  const clientName = client?.display_name || client?.legal_name;
  return (
    <Modal
      isOpen={Boolean(client)}
      onClose={onClose}
      title="Client created"
      className="max-w-md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <Button onClick={onActivate}>Activate POS now</Button>
        </div>
      }
    >
      <div className="py-1">
        <span
          className="grid h-12 w-12 place-items-center rounded-xl bg-[#E5F1E8] text-[#1A593B]"
          aria-hidden="true"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m5 12 4.2 4.2L19 6.5"
            />
          </svg>
        </span>
        <h4 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-[#17241C]">
          Would you like to activate a POS account for this client now?
        </h4>
        <p className="mt-2 text-sm leading-6 text-[#66736A]">
          {clientName} has been created successfully. Activation is optional;
          you can return to this client later when the account is ready.
        </p>
      </div>
    </Modal>
  );
}

function AccountTypeField({ value, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[#26342A]">
        Account type
      </legend>
      <p className="mt-1 text-xs leading-5 text-[#6E7A72]">
        QA identifies an internal test account. It does not change the
        activation steps.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {ACCOUNT_TYPES.map((type) => (
          <label key={type.value} className="relative block cursor-pointer">
            <input
              type="radio"
              name="account-type"
              value={type.value}
              checked={value === type.value}
              onChange={() => onChange(type.value)}
              className="peer sr-only"
            />
            <span className="block min-h-[92px] rounded-xl border border-[#D9E4DC] p-3 transition-colors peer-checked:border-primary peer-checked:bg-[#F2F8F4] peer-checked:ring-1 peer-checked:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 hover:border-[#9BBCA1]">
              <span className="block text-sm font-semibold text-[#233127]">
                {type.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[#68756D]">
                {type.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Field({ label, onChange, ...props }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-[#334238]"
      >
        {label}
      </label>
      <input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#D7E1D9] px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-[#334238]"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#D7E1D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        {options.map(([option, optionLabel]) => (
          <option key={option} value={option}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }) {
  const id = `${label.toLowerCase().replaceAll(" ", "-")}-filter`;
  return (
    <label className="block">
      <span className="sr-only">Filter by {label.toLowerCase()}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#D7E1D9] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        {options.map(([option, optionLabel]) => (
          <option key={option} value={option}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
