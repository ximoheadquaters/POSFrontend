import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import { AdminError } from "../../../components/admin/AdminUi";
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

function hasPosAccess(client) {
  return (client.client_systems || []).some(
    (assignment) =>
      (assignment.system_code === "pos" ||
        assignment.application_code === "ximo_pos") &&
      assignment.status !== "cancelled",
  );
}

function setupStatusFor(client) {
  const account = client.client_auth_account;
  if (!account) {
    return {
      label: "No website account",
      attention: true,
    };
  }
  if (!account.email_confirmed_at) {
    return {
      label: "Email verification needed",
      attention: true,
    };
  }
  return {
    label: "Website ready",
    attention: false,
  };
}

function lifecycleLabel(value) {
  const label = String(value || "Unknown").replaceAll("_", " ");
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

function clientStatusFor(client) {
  const setup = setupStatusFor(client);
  return {
    ...setup,
    label: `${lifecycleLabel(client.status)} · ${setup.label}`,
  };
}

function displayClientName(client) {
  const source = client.display_name || client.legal_name || "Unnamed client";
  return source
    .trim()
    .split(/\s+/)
    .map((word) =>
      word.length <= 3 && word === word.toUpperCase()
        ? word
        : `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
    )
    .join(" ");
}

function isClientAttention(client) {
  return setupStatusFor(client).attention || !hasPosAccess(client);
}

export default function ClientsPage() {
  const navigate = useNavigate();
  const resource = usePosResource(platformAdminApi.listClients, []);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [accountType, setAccountType] = useState("all");
  const [lifecycle, setLifecycle] = useState("all");
  const [directoryView, setDirectoryView] = useState("all");
  const [sortBy, setSortBy] = useState("attention");
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [createdClient, setCreatedClient] = useState(null);
  const [activatingClient, setActivatingClient] = useState(null);

  const clients = resource.data ?? EMPTY_CLIENTS;
  const duplicateClientIds = useMemo(() => {
    const names = new Map();
    clients.forEach((client) => {
      const key = displayClientName(client).toLowerCase();
      names.set(key, [...(names.get(key) || []), client.id]);
    });
    return new Set([...names.values()].filter((ids) => ids.length > 1).flat());
  }, [clients]);
  const attentionCount = useMemo(
    () => clients.filter(isClientAttention).length,
    [clients],
  );
  const visibleClients = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const filtered = clients.filter((client) => {
      const matchesType = accountType === "all" || client.kind === accountType;
      const matchesLifecycle =
        lifecycle === "all" || client.status === lifecycle;
      const matchesView =
        directoryView !== "attention" || isClientAttention(client);
      const matchesSelection =
        !selectedOnly || selectedClientIds.includes(client.id);
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
        matchesLifecycle &&
        matchesView &&
        matchesSelection &&
        (!keyword || searchable.includes(keyword))
      );
    });
    return filtered.sort((first, second) => {
      if (sortBy === "attention") {
        const attentionDifference =
          Number(isClientAttention(second)) - Number(isClientAttention(first));
        if (attentionDifference) return attentionDifference;
      }
      if (sortBy === "lifecycle") {
        return String(first.status).localeCompare(String(second.status));
      }
      if (sortBy === "setup") {
        return setupStatusFor(first).label.localeCompare(
          setupStatusFor(second).label,
        );
      }
      if (sortBy === "pos") {
        return Number(hasPosAccess(first)) - Number(hasPosAccess(second));
      }
      return displayClientName(first).localeCompare(displayClientName(second));
    });
  }, [
    accountType,
    clients,
    directoryView,
    lifecycle,
    query,
    selectedClientIds,
    selectedOnly,
    sortBy,
  ]);
  const hasFilters = Boolean(
    query ||
    accountType !== "all" ||
    lifecycle !== "all" ||
    directoryView !== "all" ||
    selectedOnly,
  );
  const visibleClientIds = visibleClients.map((client) => client.id);
  const allVisibleSelected =
    visibleClientIds.length > 0 &&
    visibleClientIds.every((id) => selectedClientIds.includes(id));

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
    setLifecycle("all");
    setDirectoryView("all");
    setSelectedOnly(false);
  }

  function toggleClientSelection(clientId) {
    setSelectedClientIds((current) =>
      current.includes(clientId)
        ? current.filter((id) => id !== clientId)
        : [...current, clientId],
    );
  }

  function toggleVisibleSelection() {
    setSelectedClientIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleClientIds.includes(id))
        : [...new Set([...current, ...visibleClientIds])],
    );
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
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#17241C] sm:text-3xl">
          Clients
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium tabular-nums text-[#5C685F]">
            {clients.length} clients
          </span>
          <Button onClick={openCreate}>Add client</Button>
        </div>
      </div>

      {resource.loading ? (
        <ClientDirectoryLoading />
      ) : resource.error ? (
        <AdminError error={resource.error} retry={resource.refresh} />
      ) : (
        <section
          className="border-t border-[#DDE4DE]"
          aria-label="Client directory"
        >
          <div className="py-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:min-w-0 sm:flex-1">
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
                  className="w-full rounded-xl border border-[#D7E1D9] bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 sm:min-w-0 sm:flex-1"
                />
              </label>
              <Button
                variant="secondary"
                className="shrink-0"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
              >
                Filters{hasFilters ? " · active" : ""}
              </Button>
            </div>
            {hasFilters ? (
              <AppliedFilters
                accountType={accountType}
                lifecycle={lifecycle}
                directoryView={directoryView}
                selectedOnly={selectedOnly}
                onClear={clearFilters}
              />
            ) : null}
            {filtersOpen ? (
              <div className="mt-3 grid gap-3 border-t border-[#E7ECE8] pt-3 sm:grid-cols-2 xl:grid-cols-4">
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
                  label="Lifecycle"
                  value={lifecycle}
                  onChange={setLifecycle}
                  options={[
                    ["all", "All lifecycles"],
                    ["prospect", "Prospect"],
                    ["active", "Active"],
                    ["inactive", "Inactive"],
                  ]}
                />
                <SelectFilter
                  label="View"
                  value={directoryView}
                  onChange={(value) => {
                    setDirectoryView(value);
                    if (value === "attention") setSortBy("attention");
                  }}
                  options={[
                    ["all", "All clients"],
                    ["attention", `Needs attention (${attentionCount})`],
                  ]}
                />
                <SelectFilter
                  label="Sort clients"
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    ["attention", "Attention first"],
                    ["client", "Client name"],
                    ["lifecycle", "Lifecycle"],
                    ["setup", "Setup status"],
                    ["pos", "POS access"],
                  ]}
                />
              </div>
            ) : null}
          </div>

          {selectedClientIds.length ? (
            <BulkSelectionBar
              count={selectedClientIds.length}
              selectedOnly={selectedOnly}
              onReview={() => setSelectedOnly(true)}
              onShowAll={() => setSelectedOnly(false)}
              onClear={() => {
                setSelectedClientIds([]);
                setSelectedOnly(false);
              }}
            />
          ) : null}

          {clients.length === 0 ? (
            <ClientDirectoryEmpty onCreate={openCreate} />
          ) : visibleClients.length === 0 ? (
            <ClientDirectoryEmpty filtered onClear={clearFilters} />
          ) : (
            <>
              <div className="divide-y divide-[#E9EEEA] md:grid md:grid-cols-2 md:gap-px md:divide-y-0 md:bg-[#E9EEEA] xl:hidden">
                {visibleClients.map((client) => (
                  <ClientMobileRow
                    key={client.id}
                    client={client}
                    selected={selectedClientIds.includes(client.id)}
                    isPossibleDuplicate={duplicateClientIds.has(client.id)}
                    onToggleSelection={() => toggleClientSelection(client.id)}
                    onOpen={() => navigate(`/admin/clients/${client.id}`)}
                  />
                ))}
              </div>
              <div className="hidden overflow-x-auto xl:block">
                <table
                  className="w-full min-w-[1100px] table-fixed"
                  aria-label="Client directory"
                >
                  <thead className="bg-[#F7F9F7]">
                    <tr>
                      <TableHeading className="w-[4%]">
                        <DirectoryCheckbox
                          checked={allVisibleSelected}
                          onChange={toggleVisibleSelection}
                          label={
                            allVisibleSelected
                              ? "Clear visible client selection"
                              : "Select all visible clients"
                          }
                        />
                      </TableHeading>
                      <TableHeading className="w-[29%]">Client</TableHeading>
                      <TableHeading className="w-[24%]">Status</TableHeading>
                      <TableHeading className="w-[15%]">POS</TableHeading>
                      <TableHeading className="w-[22%]">Contact</TableHeading>
                      <TableHeading className="w-[6%] text-right">
                        <span className="sr-only">Open</span>
                      </TableHeading>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EEEA]">
                    {visibleClients.map((client) => (
                      <ClientTableRow
                        key={client.id}
                        client={client}
                        selected={selectedClientIds.includes(client.id)}
                        isPossibleDuplicate={duplicateClientIds.has(client.id)}
                        onToggleSelection={() =>
                          toggleClientSelection(client.id)
                        }
                        onOpen={() => navigate(`/admin/clients/${client.id}`)}
                      />
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
      className={`px-4 py-3 text-left text-[11px] font-semibold tracking-[0.035em] text-[#5D685F] ${className}`}
    >
      {children}
    </th>
  );
}

function ClientTableRow({
  client,
  selected,
  isPossibleDuplicate,
  onToggleSelection,
  onOpen,
}) {
  const hasPos = hasPosAccess(client);
  return (
    <tr
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group cursor-pointer transition-colors hover:bg-[#FAFCFA] focus:bg-[#F4F8F5] focus:outline-none"
    >
      <td className="px-3 py-5 align-top text-center">
        <DirectoryCheckbox
          checked={selected}
          onChange={onToggleSelection}
          label={`Select ${displayClientName(client)}`}
        />
      </td>
      <td className="px-4 py-5 align-top">
        <Link
          className="block truncate text-[15px] font-semibold text-[#17241C] underline-offset-4 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          to={`/admin/clients/${client.id}`}
        >
          {displayClientName(client)}
        </Link>
        <p className="mt-1 truncate text-xs text-[#778278]">
          {client.display_name && client.legal_name !== client.display_name
            ? client.legal_name
            : accountTypeLabel(client.kind)}
          {client.primary_phone ? ` · ${client.primary_phone}` : ""}
        </p>
        {isPossibleDuplicate ? (
          <p className="mt-1 text-xs text-[#875D17]">Possible duplicate</p>
        ) : null}
      </td>
      <td className="px-4 py-5 align-top text-sm">
        <p
          className={
            clientStatusFor(client).attention
              ? "text-[#9A5A12]"
              : "text-[#556158]"
          }
        >
          {clientStatusFor(client).label}
        </p>
      </td>
      <td className="px-4 py-5 align-top text-sm">
        <PosAccessLink client={client} hasPos={hasPos} />
      </td>
      <td className="px-4 py-5 align-top text-sm text-[#536158]">
        <p className="truncate">{client.primary_email || "—"}</p>
        {client.primary_phone ? (
          <p className="mt-1 truncate text-xs text-[#7B877F]">
            {client.primary_phone}
          </p>
        ) : null}
      </td>
      <td className="px-3 py-5 text-right align-top">
        <Link
          aria-label={`Open ${displayClientName(client)}`}
          className="inline-flex min-h-10 w-10 items-center justify-center rounded-xl text-[#637168] transition hover:bg-[#EEF5F0] hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          to={`/admin/clients/${client.id}`}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9 18 6-6-6-6"
            />
          </svg>
        </Link>
      </td>
    </tr>
  );
}

function ClientMobileRow({
  client,
  selected,
  isPossibleDuplicate,
  onToggleSelection,
  onOpen,
}) {
  const hasPos = hasPosAccess(client);
  return (
    <article
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="cursor-pointer bg-white px-4 py-4 outline-none transition hover:bg-[#FAFCFA] focus:bg-[#F4F8F5] sm:px-5 md:p-5"
    >
      <div className="flex gap-3">
        <ClientAvatar name={client.display_name || client.legal_name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                className="block truncate text-sm font-semibold text-[#17241C] underline-offset-4 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                to={`/admin/clients/${client.id}`}
              >
                {displayClientName(client)}
              </Link>
              <p className="mt-1 truncate text-xs text-[#778278]">
                {client.primary_email ||
                  client.primary_phone ||
                  "No contact details"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DirectoryCheckbox
                checked={selected}
                onChange={onToggleSelection}
                label={`Select ${displayClientName(client)}`}
              />
            </div>
          </div>
          {isPossibleDuplicate ? (
            <p className="mt-2 text-xs font-medium text-[#875D17]">
              Possible duplicate name
            </p>
          ) : null}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-[#E8EEEA] py-3 text-xs">
            <StatusField label="Account type">
              <span className="text-sm text-[#556158]">
                {accountTypeLabel(client.kind)}
              </span>
            </StatusField>
            <StatusField label="Status">
              <span
                className={
                  clientStatusFor(client).attention
                    ? "text-[#9A5A12]"
                    : "text-[#556158]"
                }
              >
                {clientStatusFor(client).label}
              </span>
            </StatusField>
            <StatusField label="POS access">
              <PosAccessLink client={client} hasPos={hasPos} />
            </StatusField>
          </dl>
          <Link
            className="mt-3 inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border border-[#D7E1D9] px-3 text-sm font-semibold text-primary transition hover:bg-[#EEF5F0] md:mt-4 md:w-full"
            to={`/admin/clients/${client.id}`}
          >
            Manage client
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.9"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 18 6-6-6-6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

function PosAccessLink({ client, hasPos }) {
  if (hasPos) return <span className="text-[#556158]">Active</span>;
  return (
    <Link
      className="inline-flex items-center gap-1.5 font-medium text-[#B42318] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      to={`/admin/clients/${client.id}?activate=pos`}
      onClick={(event) => event.stopPropagation()}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      No access
    </Link>
  );
}

function StatusField({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="font-semibold text-[#6A776E]">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function DirectoryCheckbox({ checked, onChange, label }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      aria-label={label}
      className="h-4 w-4 rounded border-[#A8B8AC] text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
    />
  );
}

function BulkSelectionBar({
  count,
  selectedOnly,
  onReview,
  onShowAll,
  onClear,
}) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 border-y border-[#DCE8E0] bg-[#F7FAF8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <p className="text-sm font-semibold text-[#315241]">
        {count} {count === 1 ? "client" : "clients"} selected
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={selectedOnly ? onShowAll : onReview}
        >
          {selectedOnly ? "Show directory" : "Review selected"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear selection
        </Button>
      </div>
    </div>
  );
}

function AppliedFilters({
  accountType,
  lifecycle,
  directoryView,
  selectedOnly,
  onClear,
}) {
  const labels = [
    accountType !== "all" && accountTypeLabel(accountType),
    lifecycle !== "all" && lifecycleLabel(lifecycle),
    directoryView === "attention" && "Needs attention",
    selectedOnly && "Selected clients",
  ].filter(Boolean);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5D685F]">
      <span>Filters:</span>
      {labels.map((label) => (
        <span key={label}>{label}</span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="font-medium text-primary underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Clear
      </button>
    </div>
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
      className="border-t border-[#DDE4DE]"
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
