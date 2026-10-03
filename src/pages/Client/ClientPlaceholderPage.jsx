import { Link, useOutletContext } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { PortalIcon } from "../../components/portal/PortalShell";

const content = {
  reports: {
    title: "Reports",
    detail: "Sales summaries and completed transactions from connected stores.",
    emptyTitle: "No reports available",
    emptyDetail: "Reports will appear when your POS sales data is connected.",
    icon: "reports",
  },
  branches: {
    title: "Branches",
    detail: "Connected store locations and their operational status.",
    emptyTitle: "No branches available",
    emptyDetail: "Connected branch locations will appear here.",
    icon: "branches",
  },
  inventory: {
    title: "Inventory",
    detail: "Products and current availability from connected stores.",
    emptyTitle: "No inventory data",
    emptyDetail: "Product and stock data will appear here when available.",
    icon: "inventory",
  },
  customers: {
    title: "Customers",
    detail: "Customer records collected from the connected workspace.",
    emptyTitle: "No customers available",
    emptyDetail: "Customer records will appear here when the feature is connected.",
    icon: "customers",
  },
};

export default function ClientPlaceholderPage({ section }) {
  const { clientPreview = false, workspace = null } = useOutletContext() || {};
  const { user } = useAuth();

  if (section === "settings") {
    return <SettingsPage clientPreview={clientPreview} user={user} workspace={workspace} />;
  }

  const page = content[section] || content.reports;
  const branches = workspace?.storeData?.branches || [];
  const products = workspace?.storeData?.products || [];
  const customers = workspace?.storeData?.customers || [];
  const recentSales = workspace?.storeData?.recentSales || [];
  const metrics = workspace?.storeData?.metrics || { totalRevenue: 0, totalTransactions: 0 };
  const hasData =
    (section === "branches" && branches.length > 0) ||
    (section === "inventory" && products.length > 0) ||
    (section === "customers" && customers.length > 0) ||
    (section === "reports" && recentSales.length > 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="border-b border-[#DDE8E0] pb-5">
        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[#17241C] sm:text-3xl">{page.title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-5 text-[#6B756E]">{page.detail}</p>
      </header>

      {clientPreview ? (
        <p className="rounded-xl border border-[#E8D99E] bg-[#FFF9E7] px-4 py-3 text-sm text-[#705713]">
          Preview mode is active. Business data is not loaded.
        </p>
      ) : null}

      <section className="portal-surface">
        {section === "branches" && branches.length ? <BranchList branches={branches} /> : null}
        {section === "inventory" && products.length ? <InventoryList products={products} /> : null}
        {section === "reports" && recentSales.length ? <ReportsList sales={recentSales} metrics={metrics} /> : null}
        {section === "customers" && customers.length ? <CustomerList customers={customers} /> : null}
        {!hasData ? <EmptyPanel page={page} /> : null}
      </section>
    </div>
  );
}

function BranchList({ branches }) {
  return (
    <>
      <SectionIntro title="Locations" detail="Branch access and connection status." count={branches.length} />
      <ul className="divide-y divide-[#EDF1EE]">
        {branches.map((branch) => (
          <li key={branch.id} className="portal-list-row flex items-center gap-3 sm:px-5">
            <IconBox name="branches" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#25352B]">{branch.name}</p>
              <p className="mt-0.5 truncate text-xs text-[#748177]">
                {branch.code ? `Code: ${branch.code}` : "Connected location"}
                {branch.address ? ` · ${branch.address}` : ""}
              </p>
            </div>
            <StatusLabel value="Active" />
          </li>
        ))}
      </ul>
    </>
  );
}

function InventoryList({ products }) {
  return (
    <>
      <SectionIntro title="Products" detail="Current product catalog." count={products.length} />
      <ul className="divide-y divide-[#EDF1EE]">
        {products.map((product) => (
          <li key={product.id} className="portal-list-row flex items-center gap-3 sm:px-5">
            <IconBox name="inventory" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#25352B]">{product.name}</p>
              <p className="mt-0.5 truncate text-xs text-[#748177]">
                {product.sku ? `SKU: ${product.sku}` : "Standard product"}
                {product.unit ? ` · ${product.unit}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-[#25352B]">{formatCurrency(product.sellingPrice || 0)}</p>
              <p className="mt-0.5 text-xs capitalize text-[#748177]">{product.status || "active"}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function ReportsList({ sales, metrics }) {
  const totalTransactions = Number(metrics.totalTransactions || 0);
  const totalRevenue = Number(metrics.totalRevenue || 0);
  return (
    <>
      <SectionIntro title="Sales summary" detail="Current connected sales data." count={`${sales.length} receipts`} />
      <div className="grid divide-y divide-[#E8EEE9] border-b border-[#E8EEE9] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Summary label="Sales" value={formatCurrency(totalRevenue)} />
        <Summary label="Receipts" value={String(totalTransactions)} />
        <Summary label="Average sale" value={formatCurrency(totalTransactions ? totalRevenue / totalTransactions : 0)} />
      </div>
      <ul className="divide-y divide-[#EDF1EE]">
        {sales.map((sale) => (
          <li key={sale.id} className="portal-list-row flex items-center gap-3 sm:px-5">
            <IconBox name="reports" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#25352B]">Receipt {sale.receiptNumber || sale.id}</p>
              <p className="mt-0.5 truncate text-xs text-[#748177]">{formatDate(sale.completedAt || sale.createdAt)}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-[#25352B]">{formatCurrency(sale.total || 0)}</p>
              <p className="mt-0.5 text-xs capitalize text-[#748177]">{sale.status || "completed"}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function CustomerList({ customers }) {
  return (
    <>
      <SectionIntro title="Customer records" detail="People saved in the connected workspace." count={customers.length} />
      <ul className="divide-y divide-[#EDF1EE]">
        {customers.map((customer) => (
          <li key={customer.id} className="portal-list-row flex items-center gap-3 sm:px-5">
            <IconBox name="customers" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#25352B]">{customer.name}</p>
              <p className="mt-0.5 truncate text-xs text-[#748177]">{customer.email || customer.phone || "Customer record"}</p>
            </div>
            <StatusLabel value="Active" />
          </li>
        ))}
      </ul>
    </>
  );
}

function SectionIntro({ title, detail, count }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[#E8EEE9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div>
        <h2 className="portal-section-heading">{title}</h2>
        <p className="portal-supporting-copy mt-1">{detail}</p>
      </div>
      <span className="text-sm font-semibold text-[#1A593B]">{count}</span>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="px-4 py-4 text-left sm:px-5">
      <p className="text-xs font-medium text-[#748177]">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#25352B]">{value}</p>
    </div>
  );
}

function IconBox({ name }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B]">
      <PortalIcon name={name} className="h-[18px] w-[18px]" />
    </span>
  );
}

function StatusLabel({ value }) {
  return <span className="shrink-0 rounded-lg bg-[#EAF2EE] px-2.5 py-1 text-xs font-semibold text-[#1A593B]">{value}</span>;
}

function EmptyPanel({ page }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-5 py-8 text-center">
      <IconBox name={page.icon} />
      <h2 className="mt-3 text-base font-semibold text-[#25352B]">{page.emptyTitle}</h2>
      <p className="mt-1 max-w-md text-sm leading-5 text-[#748177]">{page.emptyDetail}</p>
    </div>
  );
}

function SettingsPage({ clientPreview, user, workspace }) {
  const accountName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || "Client account";
  const accountEmail = user?.email || "Development preview";
  const subscription = workspace?.subscription;
  const planName = subscription?.planDisplayName || "No plan information";
  const monthlyPrice = subscription?.monthlyPrice || 0;
  const status = subscription?.status || "active";
  const currentPeriodEnd = subscription?.currentPeriodEnd;

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="border-b border-[#DDE8E0] pb-5">
        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[#17241C] sm:text-3xl">Settings</h1>
        <p className="mt-1.5 text-sm leading-5 text-[#6B756E]">Account and subscription information for this workspace.</p>
      </header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)]">
        <section className="portal-surface">
          <div className="border-b border-[#E8EEE9] px-4 py-4 sm:px-5">
            <h2 className="portal-section-heading">Account</h2>
          </div>
          <dl className="divide-y divide-[#EDF1EE] px-4 sm:px-5">
            <SettingsRow label="Name" value={clientPreview ? "Preview workspace" : accountName} />
            <SettingsRow label="Email" value={accountEmail} />
            <SettingsRow label="Access" value="Store owner" />
          </dl>
        </section>
        <aside className="portal-surface">
          <div className="border-b border-[#E8EEE9] px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="portal-section-heading">Plan & billing</h2>
              <StatusLabel value={String(status).replaceAll("_", " ")} />
            </div>
            <p className="mt-3 text-lg font-semibold text-[#25352B]">{planName}</p>
            <p className="mt-1 text-sm text-[#748177]">{formatCurrency(monthlyPrice)} per month</p>
            {currentPeriodEnd ? <p className="mt-2 text-xs text-[#748177]">Paid through {formatDate(currentPeriodEnd)}</p> : null}
          </div>
          <div className="px-4 py-3 sm:px-5">
            <Link to="/client/billing" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#1A593B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#164A32]">
              Billing
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SettingsRow({ label, value }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-3">
      <dt className="text-sm text-[#748177]">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-semibold text-[#25352B]">{value}</dd>
    </div>
  );
}

function formatCurrency(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "Completed";
  return new Date(value).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
