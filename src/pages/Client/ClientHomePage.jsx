import { Link, useOutletContext } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { PortalIcon } from "../../components/portal/PortalShell";

export default function ClientHomePage() {
  const { clientPreview = false, workspace = null } = useOutletContext() || {};
  const { user } = useAuth();
  const accountName =
    user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email || "Client account";
  const totalRevenue = workspace?.storeData?.metrics?.totalRevenue ?? null;
  const totalTransactions = workspace?.storeData?.metrics?.totalTransactions ?? null;
  const recentSales = workspace?.storeData?.recentSales || [];
  const planName = workspace?.subscription?.planDisplayName || "No plan information";
  const branchCount = workspace?.storeData?.branches?.length || 0;

  const summary = [
    {
      label: "Sales",
      value: totalRevenue !== null ? formatCurrency(totalRevenue) : "—",
      detail: totalRevenue !== null ? "Gross sales" : "Waiting for POS data",
      icon: "reports",
    },
    {
      label: "Transactions",
      value: totalTransactions !== null ? String(totalTransactions) : "—",
      detail: totalTransactions !== null ? "Completed sales" : "Waiting for POS data",
      icon: "pos",
    },
    {
      label: "Branches",
      value: branchCount ? String(branchCount) : "—",
      detail: branchCount ? "Connected locations" : "No branch data",
      icon: "branches",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#DDE8E0] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[#17241C] sm:text-3xl">
            Business overview
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-5 text-[#6B756E]">
            {clientPreview
              ? "Preview the workspace structure without accessing business data."
              : `Current business activity for ${firstName(accountName)}.`}
          </p>
        </div>
        <Link
          to="/client/reports"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1A593B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#164A32]"
        >
          Reports
        </Link>
      </header>

      {clientPreview ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#E8D99E] bg-[#FFF9E7] p-4 text-sm leading-5 text-[#705713]">
          <PortalIcon name="home" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Preview mode is active. Your business information is not shown here.</p>
        </div>
      ) : null}

      <section className="portal-surface grid divide-y divide-[#E8EEE9] sm:grid-cols-3 sm:divide-x sm:divide-y-0" aria-label="Business summary">
        {summary.map((item) => (
          <article key={item.label} className="flex items-center gap-3 px-4 py-4 sm:px-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B]">
              <PortalIcon name={item.icon} className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-semibold tracking-[-0.035em] text-[#25352B] sm:text-2xl">{item.value}</p>
              <p className="text-sm font-medium text-[#4F5E54]">{item.label}</p>
              <p className="mt-0.5 text-xs text-[#819087]">{item.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
        <article className="portal-surface">
          <div className="flex flex-col gap-3 border-b border-[#E8EEE9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="portal-section-heading">Recent sales</h2>
              <p className="portal-supporting-copy mt-1">Completed POS transactions.</p>
            </div>
            <Link to="/client/reports" className="text-sm font-semibold text-[#1A593B] hover:text-[#164A32]">
              View reports
            </Link>
          </div>
          {recentSales.length ? (
            <ul className="divide-y divide-[#EDF1EE]">
              {recentSales.slice(0, 5).map((sale) => (
                <li key={sale.id} className="portal-list-row flex items-center gap-3 sm:px-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-sm font-semibold text-[#1A593B]">₱</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#25352B]">
                      Receipt {sale.receiptNumber || sale.id}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[#748177]">
                      {formatDate(sale.completedAt || sale.createdAt)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-[#25352B]">{formatCurrency(sale.total || 0)}</span>
                    <span className="mt-0.5 block text-xs capitalize text-[#748177]">{sale.status || "completed"}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPanel
              icon="reports"
              title="No sales activity yet"
              message="Completed POS sales will appear here."
              action="Open reports"
              to="/client/reports"
            />
          )}
        </article>

        <aside className="portal-surface">
          <div className="border-b border-[#E8EEE9] px-4 py-4 sm:px-5">
            <h2 className="portal-section-heading">Workspace</h2>
            <p className="portal-supporting-copy mt-1">Your Ximo connection and access.</p>
          </div>
          <dl className="divide-y divide-[#EDF1EE] px-4 sm:px-5">
            <Detail label="Plan" value={planName} />
            <Detail label="Branches" value={branchCount ? `${branchCount} connected` : "No branch data"} />
            <Detail label="Account" value={clientPreview ? "Preview workspace" : accountName} />
          </dl>
          <div className="border-t border-[#E8EEE9] px-4 py-3 sm:px-5">
            <Link to="/client/settings" className="text-sm font-semibold text-[#1A593B] hover:text-[#164A32]">
              Workspace settings
            </Link>
          </div>
        </aside>
      </section>

      <section className="portal-surface">
        <div className="flex flex-col gap-3 border-b border-[#E8EEE9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="portal-section-heading">Activity</h2>
            <p className="portal-supporting-copy mt-1">Latest records from connected stores.</p>
          </div>
          <span className="text-xs font-medium text-[#748177]">
            {recentSales.length ? `${recentSales.length} recent transactions` : "No recent activity"}
          </span>
        </div>
        {recentSales.length ? (
          <ul className="divide-y divide-[#EDF1EE]">
            {recentSales.slice(0, 5).map((sale) => (
              <li key={sale.id} className="portal-list-row flex items-center gap-3 sm:px-5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#1A593B]" />
                <span className="min-w-0 flex-1 truncate text-sm text-[#435248]">
                  Receipt <span className="font-semibold">{sale.receiptNumber || sale.id}</span> completed
                </span>
                <span className="shrink-0 text-sm font-semibold text-[#25352B]">{formatCurrency(sale.total || 0)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-[#748177]">Activity will appear as stores use Ximo POS.</p>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-3">
      <dt className="text-sm text-[#748177]">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-semibold text-[#25352B]">{value}</dd>
    </div>
  );
}

function EmptyPanel({ icon, title, message, action, to }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-5 py-8 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B]">
        <PortalIcon name={icon} className="h-5 w-5" />
      </span>
      <p className="mt-3 text-base font-semibold text-[#25352B]">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-5 text-[#748177]">{message}</p>
      <Link to={to} className="mt-4 text-sm font-semibold text-[#1A593B] hover:text-[#164A32]">{action}</Link>
    </div>
  );
}

function firstName(value) {
  return String(value || "there").trim().split(/[\s@]/)[0];
}

function formatCurrency(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "Completed";
  return new Date(value).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
