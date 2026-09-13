import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../app/axios";

const content = {
  reports: {
    eyebrow: "Reporting",
    title: "Reports, ready when your data is.",
    detail:
      "Daily, weekly, and monthly views will bring the numbers behind your business into one place.",
    panelTitle: "No reports are available yet",
    panelDetail:
      "Once reporting is connected, this page will hold saved reports, date ranges, exports, and the metrics that matter to your business.",
    notes: [
      "Daily sales summaries",
      "Date-range reporting",
      "Downloadable exports",
    ],
    icon: ReportsIcon,
  },
  branches: {
    eyebrow: "Locations",
    title: "Keep every branch in view.",
    detail:
      "Branch details, operating status, and location-level performance will be managed here.",
    panelTitle: "No branches are available yet",
    panelDetail:
      "When branch management is connected, each location will appear here with the details needed to manage it day to day.",
    notes: [
      "Location directory",
      "Branch-level performance",
      "Central operational view",
    ],
    icon: BranchesIcon,
  },
  inventory: {
    eyebrow: "Stock",
    title: "Inventory that stays close to the work.",
    detail:
      "Product availability, stock movement, and replenishment signals will be available here.",
    panelTitle: "No inventory data is available yet",
    panelDetail:
      "This page is ready for product counts, stock movement, and the signals that help your team stay ahead.",
    notes: ["Product availability", "Stock movement", "Reorder attention"],
    icon: InventoryIcon,
  },
  customers: {
    eyebrow: "Customers",
    title: "A clearer picture of who you serve.",
    detail:
      "Customer profiles, visit history, and relationship notes will be collected in this workspace.",
    panelTitle: "No customer data is available yet",
    panelDetail:
      "When customer data is connected, your team will be able to find profiles, view history, and support the next visit with context.",
    notes: ["Customer profiles", "Visit history", "Purchase context"],
    icon: CustomersIcon,
  },
};

export default function ClientPlaceholderPage({ section }) {
  const { clientPreview = false } = useOutletContext() || {};
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/client/workspace")
      .then((res) => {
        if (mounted && res.data?.data) {
          setWorkspace(res.data.data);
        }
      })
      .catch((err) => console.warn("Failed to load workspace data:", err?.message))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [section]);

  if (section === "settings") {
    return (
      <SettingsPage
        clientPreview={clientPreview}
        user={user}
        workspace={workspace}
      />
    );
  }

  const page = content[section] || content.reports;
  const Icon = page.icon;

  const branches = workspace?.storeData?.branches || [];
  const products = workspace?.storeData?.products || [];
  const customers = workspace?.storeData?.customers || [];
  const recentSales = workspace?.storeData?.recentSales || [];
  const metrics = workspace?.storeData?.metrics || {
    totalRevenue: 0,
    totalTransactions: 0,
  };

  const hasData =
    (section === "branches" && branches.length > 0) ||
    (section === "inventory" && products.length > 0) ||
    (section === "customers" && customers.length > 0) ||
    (section === "reports" && recentSales.length > 0);

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 border-b border-[#DDE7DF] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            {page.eyebrow}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.055em] text-[#1A2C21] sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66766B] sm:text-base">
            {page.detail}
          </p>
        </div>
        <span className="w-fit rounded-full bg-[#E8F1EA] px-3 py-1.5 text-xs font-semibold text-primary">
          {hasData ? "Live store data" : "Active workspace"}
        </span>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#DDE7DF] bg-white">
        {/* Branches Data View */}
        {section === "branches" && branches.length > 0 && (
          <div className="divide-y divide-[#E8EEE9]">
            <div className="px-6 py-4 bg-[#F9FBF9] border-b border-[#E8EEE9] flex justify-between items-center text-xs font-bold text-[#5A685D] uppercase tracking-wider">
              <span>Branch Name & Location</span>
              <span>Status</span>
            </div>
            {branches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-6 py-4 transition hover:bg-[#F9FBF9]"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F1EA] text-primary">
                    <BranchesIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1F2923]">
                      {b.name}
                    </p>
                    <p className="text-xs text-[#77877C]">
                      Code: <span className="font-mono">{b.code}</span>
                      {b.address ? ` · ${b.address}` : ""}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Inventory Data View */}
        {section === "inventory" && products.length > 0 && (
          <div className="divide-y divide-[#E8EEE9]">
            <div className="px-6 py-4 bg-[#F9FBF9] border-b border-[#E8EEE9] flex justify-between items-center text-xs font-bold text-[#5A685D] uppercase tracking-wider">
              <span>Product Item</span>
              <span>Selling Price</span>
            </div>
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-6 py-4 transition hover:bg-[#F9FBF9]"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F1EA] text-primary">
                    <InventoryIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1F2923]">
                      {p.name}
                    </p>
                    <p className="text-xs text-[#77877C]">
                      {p.sku ? (
                        <span className="font-mono">SKU: {p.sku}</span>
                      ) : (
                        "Standard product"
                      )}
                      {p.unit ? ` · ${p.unit}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#1F2923]">
                    ₱
                    {Number(p.sellingPrice || 0).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="block text-[10px] text-emerald-700 font-bold capitalize">
                    {p.status || "active"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports Data View */}
        {section === "reports" && recentSales.length > 0 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E8EEE9] border-b border-[#E8EEE9] bg-[#F9FBF9]">
              <div className="p-5 text-center">
                <p className="text-xs text-[#5A685D] font-medium">
                  Total Sales Revenue
                </p>
                <p className="mt-1 text-2xl font-bold text-[#1F2923]">
                  ₱
                  {Number(metrics.totalRevenue || 0).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-5 text-center">
                <p className="text-xs text-[#5A685D] font-medium">
                  Total Receipts
                </p>
                <p className="mt-1 text-2xl font-bold text-[#1F2923]">
                  {metrics.totalTransactions || 0}
                </p>
              </div>
              <div className="p-5 text-center">
                <p className="text-xs text-[#5A685D] font-medium">
                  Average Ticket
                </p>
                <p className="mt-1 text-2xl font-bold text-[#1F2923]">
                  ₱
                  {metrics.totalTransactions > 0
                    ? (
                        Number(metrics.totalRevenue) /
                        metrics.totalTransactions
                      ).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E8EEE9]">
              <div className="px-6 py-4 bg-white flex justify-between items-center text-xs font-bold text-[#5A685D] uppercase tracking-wider">
                <span>Recent Transactions Report</span>
                <span>Amount (PHP)</span>
              </div>
              {recentSales.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-6 py-4 transition hover:bg-[#F9FBF9]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1F2923]">
                      Receipt #{s.receiptNumber}
                    </p>
                    <p className="text-xs text-[#77877C]">
                      {s.completedAt || s.createdAt
                        ? new Date(
                            s.completedAt || s.createdAt,
                          ).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Completed"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1F2923]">
                      ₱
                      {Number(s.total || 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700 capitalize">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers Data View */}
        {section === "customers" && customers.length > 0 && (
          <div className="divide-y divide-[#E8EEE9]">
            {customers.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-6 py-4 transition hover:bg-[#F9FBF9]"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F1EA] text-primary">
                    <CustomersIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1F2923]">
                      {c.name}
                    </p>
                    <p className="text-xs text-[#77877C]">
                      {c.email || c.phone || "Customer record"}
                    </p>
                  </div>
                </div>
                <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700">
                  Active
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Fallback empty panel if no data yet */}
        {!hasData && (
          <div className="grid min-h-[340px] place-items-center px-6 py-12 text-center">
            <div className="max-w-xl">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-[#E8F1EA] text-primary">
                <Icon className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#24362A]">
                {page.panelTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#77877C]">
                {page.panelDetail}
              </p>
            </div>
          </div>
        )}

        <div className="grid border-t border-[#E8EEE9] sm:grid-cols-3">
          {page.notes.map((note) => (
            <p
              key={note}
              className="border-b border-[#E8EEE9] px-6 py-5 text-sm font-semibold text-[#4A5B50] last:border-b-0 sm:border-b-0 sm:not-last:border-r"
            >
              {note}
            </p>
          ))}
        </div>
      </section>

      {clientPreview && (
        <p className="text-sm leading-6 text-[#77877C]">
          Development preview mode does not load business data.
        </p>
      )}
    </div>
  );
}

function SettingsPage({ clientPreview, user, workspace }) {
  const accountName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    "Client account";
  const accountEmail = user?.email || "Development preview";

  const subscription = workspace?.subscription;
  const planName = subscription?.planDisplayName || "Starter Plan";
  const monthlyPrice = subscription?.monthlyPrice || "499.00";
  const status = subscription?.status || "active";
  const currentPeriodEnd = subscription?.currentPeriodEnd;
  const daysRemaining = subscription?.daysRemaining;

  return (
    <div className="space-y-7">
      <section className="border-b border-[#DDE7DF] pb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
          Account
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#1A2C21] sm:text-5xl">
          Workspace settings.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66766B] sm:text-base">
          Your account, workspace preferences, and plan controls will be managed
          here.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)]">
        <section className="rounded-xl border border-[#DDE7DF] bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Signed-in account
          </p>
          <dl className="mt-5 divide-y divide-[#E8EEE9] border-y border-[#E8EEE9]">
            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-sm text-[#77877C]">Name</dt>
              <dd className="text-sm font-semibold text-[#27392C]">
                {clientPreview ? "Preview workspace" : accountName}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-sm text-[#77877C]">Email</dt>
              <dd className="text-sm font-semibold text-[#27392C]">
                {accountEmail}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-sm text-[#77877C]">Workspace access</dt>
              <dd className="text-sm font-semibold text-[#27392C]">
                Store Owner
              </dd>
            </div>
          </dl>
        </section>

        <aside className="rounded-xl border border-[#DDE7DF] bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Plan & billing
              </p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {status.toUpperCase()}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-[#27392C]">
              {planName}
            </h2>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1F2923]">
                ₱
                {Number(monthlyPrice).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-[#77877C]">/ month</span>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E8EEE9] space-y-1.5 text-xs text-[#5A685D]">
              {currentPeriodEnd && (
                <p>
                  Paid through:{" "}
                  <strong className="text-[#1F2923]">
                    {new Date(currentPeriodEnd).toLocaleDateString("en-PH", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                  {daysRemaining !== undefined ? ` (${daysRemaining} days remaining)` : ""}
                </p>
              )}
              <p>Payment Mode: QR Ph (PayMongo)</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8EEE9]">
            <Link
              to="/client/billing"
              className="inline-flex min-h-[42px] w-full items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#164F34]"
            >
              Manage Full Billing & Renewal →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReportsIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 20.5V10.8m7 9.7V3.5m7 17V14.3"
      />
      <path strokeLinecap="round" d="M3.5 20.5h17" />
    </svg>
  );
}
function BranchesIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20V9.5l8-5 8 5V20M8 20v-5h8v5M9 10h.01M15 10h.01"
      />
    </svg>
  );
}
function InventoryIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 7.5 8-4 8 4-8 4-8-4Zm0 4.5 8 4 8-4m-16 4.5 8 4 8-4"
      />
    </svg>
  );
}
function CustomersIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="8" r="3" />
      <path
        strokeLinecap="round"
        d="M3.8 20c.7-3.4 2.5-5.2 5.2-5.2s4.5 1.8 5.2 5.2M16.5 5.5a2.6 2.6 0 0 1 0 5.1M16 15.1c2.1.5 3.5 2.1 4.1 4.9"
      />
    </svg>
  );
}
