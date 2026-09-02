import { Link } from "react-router-dom";
import usePosResource from "../../hooks/usePosResource";
import { platformAdminApi } from "../../services/platformAdminApi";
import { StatusBadge } from "../../components/pos/PosUi";

export default function Dashboard() {
  const clientsResource = usePosResource(platformAdminApi.listClients, []);
  const systemsResource = usePosResource(platformAdminApi.listSystems, []);
  const clients = clientsResource.data || [];
  const systems = systemsResource.data || [];
  const assignedSystems = clients.reduce(
    (total, client) => total + (client.client_systems?.length || 0),
    0,
  );
  const availableSystems = systems.filter(
    (system) => system.availability === "available",
  ).length;

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-6 border-b border-[#E2E6EB] pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA2AD]">Ximo platform</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#252B3A] sm:text-5xl">Good morning, admin.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#737D8C] sm:text-base">A direct view of the clients, systems, and operational decisions moving across Ximo today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/admin/clients" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(26,89,59,0.16)] transition hover:bg-primary-600">View clients</Link>
          <Link to="/admin/systems" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-700">Explore systems <Arrow /></Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 [&>*:last-child]:col-span-2 sm:grid-cols-3 sm:gap-4 sm:[&>*:last-child]:col-span-1">
        <Metric icon={<ClientsIcon />} label="Client records" value={clientsResource.loading ? "—" : clients.length} detail="Across the platform" />
        <Metric icon={<LinkIcon />} label="Product assignments" value={clientsResource.loading ? "—" : assignedSystems} detail="Connected to clients" />
        <Metric icon={<SystemsIcon />} label="Available systems" value={systemsResource.loading ? "—" : availableSystems} detail="Ready to be assigned" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.55fr)]">
        <div className="overflow-hidden rounded-2xl border border-[#E2E6EB] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#EEF0F2] px-6 py-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.035em] text-[#252B3A]">Client portfolio</h2>
              <p className="mt-1 text-sm text-[#8B94A0]">Recent records and their connected Ximo systems.</p>
            </div>
            <Link to="/admin/clients" className="text-sm font-semibold text-primary transition hover:text-primary-700">All clients</Link>
          </div>
          {clientsResource.loading ? <LoadingCopy text="Loading client records…" /> : clientsResource.error ? <LoadingCopy text="Client records could not be loaded." error /> : clients.length ? <div className="divide-y divide-[#F0F2F4]">{clients.slice(0, 5).map((client) => <Link key={client.id} to={`/admin/clients/${client.id}`} className="group flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-[#FAFBFC]"><div className="flex min-w-0 items-center gap-3"><ClientMark name={client.display_name || client.legal_name} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#303746]">{client.display_name || client.legal_name}</p><p className="mt-0.5 truncate text-xs text-[#929AA5]">{client.industry || client.primary_email || "Client record"}</p></div></div><div className="flex shrink-0 items-center gap-3"><span className="hidden text-xs text-[#929AA5] sm:inline">{client.client_systems?.length || 0} systems</span><StatusBadge value={client.status} /><Arrow /></div></Link>)}</div> : <DashboardEmpty title="No client records yet" detail="Create the first client record to begin assigning Ximo systems." action="Add a client" to="/admin/clients" />}
        </div>

        <aside className="rounded-2xl border border-[#E2E6EB] bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.035em] text-[#252B3A]">Systems</h2>
              <p className="mt-1 text-sm leading-6 text-[#8B94A0]">Products currently available to your client portfolio.</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#F3F5F6] text-[#7F8793]"><SystemsIcon className="h-[18px] w-[18px]" /></span>
          </div>
          <div className="mt-6 space-y-2">
            {systemsResource.loading ? <LoadingCopy text="Loading systems…" compact /> : systemsResource.error ? <LoadingCopy text="Systems could not be loaded." compact error /> : systems.length ? systems.slice(0, 4).map((system) => <Link key={system.code} to={`/admin/systems/${system.code}`} className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-[#FAFBFC]"><div className="flex min-w-0 items-center gap-3"><SystemMark code={system.code} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#303746]">{system.name}</p><p className="mt-0.5 truncate text-xs text-[#929AA5]">{system.description || "Ximo system"}</p></div></div><StatusBadge value={system.availability} /></Link>) : <DashboardEmpty title="No systems available" detail="The product catalog will appear here once configured." action="Manage systems" to="/admin/systems" compact />}
          </div>
          <Link to="/admin/systems" className="mt-6 inline-flex items-center text-sm font-semibold text-primary transition hover:text-primary-700">Open product catalog</Link>
        </aside>
      </section>
    </div>
  );
}

function Metric({ icon, label, value, detail }) { return <article className="rounded-2xl border border-[#E2E6EB] bg-white p-4 sm:p-5"><div className="flex items-start justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#F3F5F6] text-[#7D8794]">{icon}</span><strong className="text-2xl font-semibold tracking-[-0.05em] text-[#252B3A] sm:text-3xl">{value}</strong></div><p className="mt-4 text-sm font-semibold text-[#434B58] sm:mt-6">{label}</p><p className="mt-1 text-xs text-[#9AA2AD]">{detail}</p></article>; }
function LoadingCopy({ text, error = false, compact = false }) { return <p className={`${compact ? "py-4" : "py-14 text-center"} text-sm ${error ? "text-[#A13E35]" : "text-[#8B94A0]"}`}>{text}</p>; }
function ClientMark({ name }) { return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F0F2F4] text-xs font-bold text-[#697382]">{String(name || "C").slice(0, 1).toUpperCase()}</span>; }
function SystemMark({ code }) { return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F0F2F4] text-[10px] font-bold uppercase tracking-wide text-[#697382]">{String(code || "X").slice(0, 3)}</span>; }
function DashboardEmpty({ title, detail, action, to, compact = false }) { return <div className={`flex flex-col justify-center ${compact ? "min-h-36" : "min-h-64 px-6"}`}><p className="text-lg font-semibold tracking-[-0.03em] text-[#303746]">{title}</p><p className="mt-2 max-w-sm text-sm leading-6 text-[#8B94A0]">{detail}</p><Link to={to} className="mt-5 inline-flex w-fit items-center text-sm font-semibold text-primary transition hover:text-primary-700">{action}</Link></div>; }
function ClientsIcon() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3" /><path strokeLinecap="round" d="M3.8 20c.7-3.4 2.5-5.2 5.2-5.2s4.5 1.8 5.2 5.2M16.5 5.5a2.6 2.6 0 0 1 0 5.1" /></svg>; }
function LinkIcon() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 13.5 13.5 10.5M7.2 16.8l-1.1 1.1a3 3 0 0 1-4.2-4.2l3.2-3.2a3 3 0 0 1 4.2 0M16.8 7.2l1.1-1.1a3 3 0 0 1 4.2 4.2l-3.2 3.2a3 3 0 0 1-4.2 0" /></svg>; }
function SystemsIcon({ className = "h-[18px] w-[18px]" }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19.5 8v8L12 20.5 4.5 16V8L12 3.5Z" /><path strokeLinecap="round" d="m4.8 8 7.2 4.2L19.2 8M12 12.2v8" /></svg>; }
