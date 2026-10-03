import { Link, useOutletContext } from "react-router-dom";
import usePosResource from "../../hooks/usePosResource";
import { platformAdminApi } from "../../services/platformAdminApi";
import { StatusBadge } from "../../components/pos/PosUi";
import { PortalIcon } from "../../components/portal/PortalShell";

export default function Dashboard() {
  const { adminPreview = false } = useOutletContext() || {};
  const clientsResource = usePosResource(platformAdminApi.listClients, []);
  const systemsResource = usePosResource(platformAdminApi.listSystems, []);
  const clients = adminPreview ? previewClients : clientsResource.data || [];
  const systems = adminPreview ? previewSystems : systemsResource.data || [];
  const clientsLoading = adminPreview ? false : clientsResource.loading;
  const systemsLoading = adminPreview ? false : systemsResource.loading;
  const clientsError = adminPreview ? null : clientsResource.error;
  const systemsError = adminPreview ? null : systemsResource.error;
  const assignedSystems = clients.reduce(
    (total, client) => total + (client.client_systems?.length || 0),
    0,
  );
  const availableSystems = systems.filter(
    (system) => system.availability === "available",
  ).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#DDE8E0] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[#17241C] sm:text-3xl">
            Platform overview
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-5 text-[#6B756E]">
            Client access, product availability, and current platform activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/clients"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1A593B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#164A32]"
          >
            Clients
          </Link>
          <Link
            to="/admin/systems"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#C9D9CC] bg-white px-4 text-sm font-semibold text-[#1A593B] transition-colors hover:bg-[#F0F4F2]"
          >
            Systems
          </Link>
        </div>
      </header>

      <section
        className="portal-surface grid divide-y divide-[#E8EEE9] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        aria-label="Platform totals"
      >
        <Summary
          label="Clients"
          value={clientsLoading ? "—" : clients.length}
          detail="Client records"
          icon="clients"
        />
        <Summary
          label="Assignments"
          value={clientsLoading ? "—" : assignedSystems}
          detail="Product connections"
          icon="pos"
        />
        <Summary
          label="Available systems"
          value={systemsLoading ? "—" : availableSystems}
          detail="Ready to assign"
          icon="systems"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
        <article className="portal-surface">
          <div className="flex flex-col gap-3 border-b border-[#E8EEE9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="portal-section-heading">Clients</h2>
              <p className="portal-supporting-copy mt-1">
                Recently created client records.
              </p>
            </div>
            <Link
              to="/admin/clients"
              className="text-sm font-semibold text-[#1A593B] hover:text-[#164A32]"
            >
              Manage clients
            </Link>
          </div>
          {clientsLoading ? (
            <LoadingCopy text="Loading client records" />
          ) : clientsError ? (
            <LoadingCopy text="Client records could not be loaded." error />
          ) : clients.length ? (
            <ul className="divide-y divide-[#EDF1EE]">
              {clients.slice(0, 5).map((client) => (
                <li key={client.id}>
                  <Link
                    to={`/admin/clients/${client.id}`}
                    className="portal-list-row flex items-center gap-3 sm:px-5"
                  >
                    <ClientMark
                      name={client.display_name || client.legal_name}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#25352B]">
                        {client.display_name || client.legal_name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#748177]">
                        {client.industry ||
                          client.primary_email ||
                          "Client record"}
                      </span>
                    </span>
                    <span className="hidden text-xs text-[#748177] sm:inline">
                      {client.client_systems?.length || 0} systems
                    </span>
                    <StatusBadge value={client.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <DashboardEmpty
              title="No client records yet"
              detail="Add a client before assigning Ximo systems."
              action="Add client"
              to="/admin/clients"
            />
          )}
        </article>

        <aside className="portal-surface">
          <div className="flex items-start justify-between gap-3 border-b border-[#E8EEE9] px-4 py-4 sm:px-5">
            <div>
              <h2 className="portal-section-heading">Systems</h2>
              <p className="portal-supporting-copy mt-1">
                Products available to assign.
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B]">
              <PortalIcon name="systems" className="h-[18px] w-[18px]" />
            </span>
          </div>
          {systemsLoading ? (
            <LoadingCopy text="Loading systems" compact />
          ) : systemsError ? (
            <LoadingCopy text="Systems could not be loaded." compact error />
          ) : systems.length ? (
            <ul className="divide-y divide-[#EDF1EE]">
              {systems.slice(0, 4).map((system) => (
                <li key={system.code}>
                  <Link
                    to={`/admin/systems/${system.code}`}
                    className="portal-list-row flex items-center gap-3 sm:px-5"
                  >
                    <SystemMark code={system.code} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#25352B]">
                        {system.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#748177]">
                        {system.description || "Ximo system"}
                      </span>
                    </span>
                    <StatusBadge value={system.availability} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <DashboardEmpty
              title="No systems available"
              detail="Configured products will appear here."
              action="Manage systems"
              to="/admin/systems"
              compact
            />
          )}
          {systems.length ? (
            <div className="border-t border-[#E8EEE9] px-4 py-3 sm:px-5">
              <Link
                to="/admin/systems"
                className="text-sm font-semibold text-[#1A593B] hover:text-[#164A32]"
              >
                Manage systems
              </Link>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}

const previewClients = [
  {
    id: "preview-gamora",
    display_name: "Gamora Retail",
    industry: "Retail",
    status: "active",
    client_systems: [{ id: "pos" }],
  },
  {
    id: "preview-north",
    display_name: "Northside Foods",
    industry: "Food service",
    status: "active",
    client_systems: [{ id: "pos" }],
  },
  {
    id: "preview-market",
    display_name: "Market Street",
    industry: "Retail",
    status: "prospect",
    client_systems: [],
  },
];

const previewSystems = [
  {
    code: "pos",
    name: "Ximo POS",
    description: "Point of sale and inventory",
    availability: "available",
  },
];

function Summary({ label, value, detail, icon }) {
  return (
    <article className="flex items-center gap-3 px-4 py-4 sm:px-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B]">
        <PortalIcon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold tracking-[-0.035em] text-[#25352B] sm:text-2xl">
          {value}
        </p>
        <p className="text-sm font-medium text-[#4F5E54]">{label}</p>
        <p className="mt-0.5 text-xs text-[#819087]">{detail}</p>
      </div>
    </article>
  );
}

function LoadingCopy({ text, error = false, compact = false }) {
  return (
    <p
      className={`${compact ? "px-4 py-6" : "px-4 py-12 text-center"} text-sm ${error ? "text-[#A13E35]" : "text-[#748177]"}`}
    >
      {text}
    </p>
  );
}

function ClientMark({ name }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-xs font-semibold text-[#1A593B]">
      {String(name || "C")
        .slice(0, 1)
        .toUpperCase()}
    </span>
  );
}

function SystemMark({ code }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-[10px] font-semibold uppercase tracking-wide text-[#1A593B]">
      {String(code || "X").slice(0, 3)}
    </span>
  );
}

function DashboardEmpty({ title, detail, action, to, compact = false }) {
  return (
    <div
      className={`flex flex-col justify-center ${compact ? "min-h-36 px-4 py-6" : "min-h-52 px-5 py-8"}`}
    >
      <p className="text-base font-semibold text-[#25352B]">{title}</p>
      <p className="mt-1 text-sm leading-5 text-[#748177]">{detail}</p>
      <Link
        to={to}
        className="mt-4 w-fit text-sm font-semibold text-[#1A593B] hover:text-[#164A32]"
      >
        {action}
      </Link>
    </div>
  );
}
