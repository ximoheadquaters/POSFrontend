import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../app/axios";

export default function ClientHomePage() {
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
  }, []);

  const firstName = String(
    user?.user_metadata?.display_name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "there",
  ).split(/[\s@]/)[0];

  const totalRevenue = workspace?.storeData?.metrics?.totalRevenue ?? null;
  const totalTransactions =
    workspace?.storeData?.metrics?.totalTransactions ?? null;
  const recentSales = workspace?.storeData?.recentSales || [];
  const planName = workspace?.subscription?.planDisplayName || "Starter Plan";

  const overviewCards = [
    {
      label: "Income",
      value:
        totalRevenue !== null
          ? `₱${Number(totalRevenue).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
          : "—",
      detail:
        totalRevenue !== null
          ? "Gross sales across your store"
          : "Waiting for POS sales data",
    },
    {
      label: "Sales",
      value:
        totalRevenue !== null
          ? `₱${Number(totalRevenue).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
          : "—",
      detail: workspace?.subscription
        ? `${planName} active`
        : "Waiting for POS sales data",
    },
    {
      label: "Transactions",
      value: totalTransactions !== null ? String(totalTransactions) : "—",
      detail:
        totalTransactions !== null
          ? "Completed POS transactions"
          : "Waiting for POS sales data",
    },
  ];

  const setupItems = [
    [
      "Sales feed",
      recentSales.length > 0
        ? `${recentSales.length} recent transactions recorded.`
        : "Connects daily sales and income to this dashboard.",
    ],
    ["Reports", "Makes daily, weekly, and monthly reporting available."],
    [
      "Branches",
      workspace?.storeData?.branches?.length
        ? `${workspace.storeData.branches.length} branch location${workspace.storeData.branches.length === 1 ? "" : "s"} connected.`
        : "Keeps each business location in one shared workspace.",
    ],
  ];

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 border-b border-[#DDE7DF] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            Business overview
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#1A2C21] sm:text-5xl">
            Good morning, {firstName}.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66766B] sm:text-base">
            Your client workspace is ready for your sales, reporting, branch,
            and day-to-day operations data.
          </p>
        </div>
        <Link
          to="/client/reports"
          className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-[#C9D9CC] bg-white px-4 text-sm font-semibold text-primary transition hover:border-primary hover:bg-[#F3F7F3]"
        >
          Open reports
        </Link>
      </section>

      {clientPreview && (
        <div className="flex items-start gap-3 rounded-xl border border-[#E9D99D] bg-[#FFF9E7] p-4 text-sm leading-6 text-[#705713]">
          <PreviewIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong className="font-semibold">Development preview:</strong> this
            route is temporarily available without a client session. It does not
            load or expose business data.
          </p>
        </div>
      )}

      <section
        className="grid gap-3 sm:grid-cols-3 sm:gap-4"
        aria-label="Business overview metrics"
      >
        {overviewCards.map((item) => (
          <article
            key={item.label}
            className="rounded-xl border border-[#DDE7DF] bg-white p-5"
          >
            <p className="text-sm font-semibold text-[#4A5D50]">{item.label}</p>
            <p className="mt-6 text-3xl font-semibold tracking-[-0.055em] text-[#203127]">
              {item.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-[#86958B]">
              {item.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <article className="overflow-hidden rounded-xl border border-[#DDE7DF] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#E8EEE9] px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.035em] text-[#203127]">
                Sales activity
              </h2>
              <p className="mt-1 text-sm text-[#77877C]">
                Income, sales, and transaction trends will appear here.
              </p>
            </div>
            <span className="w-fit rounded-full bg-[#F1F5F1] px-3 py-1.5 text-xs font-semibold text-[#68786D]">
              {recentSales.length > 0
                ? `${recentSales.length} recent receipt${recentSales.length === 1 ? "" : "s"}`
                : "No data connected"}
            </span>
          </div>

          {recentSales.length > 0 ? (
            <div className="divide-y divide-[#E8EEE9]">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between px-6 py-4 transition hover:bg-[#F9FBF9]"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E8F1EA] text-sm font-bold text-primary">
                      ₱
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#203127]">
                        Receipt #{sale.receiptNumber}
                      </p>
                      <p className="text-xs text-[#77877C]">
                        {sale.completedAt || sale.createdAt
                          ? new Date(
                              sale.completedAt || sale.createdAt,
                            ).toLocaleDateString("en-PH", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Completed"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#203127]">
                      ₱
                      {Number(sale.total || 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 capitalize">
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[250px] flex-col items-center justify-center px-6 py-10 text-center">
              <SalesIcon className="h-9 w-9 text-[#A6B5AA]" />
              <p className="mt-4 text-lg font-semibold tracking-[-0.025em] text-[#2A3C30]">
                Your sales overview will appear here.
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#77877C]">
                This space is ready for the POS sales feed when it is connected to
                the client workspace.
              </p>
            </div>
          )}
        </article>

        <aside className="rounded-xl border border-[#DDE7DF] bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Workspace setup
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-[#203127]">
            What will live here
          </h2>
          <div className="mt-5 divide-y divide-[#E8EEE9] border-y border-[#E8EEE9]">
            {setupItems.map(([title, detail]) => (
              <div key={title} className="py-4">
                <p className="text-sm font-semibold text-[#2B3D31]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#77877C]">{detail}</p>
              </div>
            ))}
          </div>
          <Link
            to="/client/settings"
            className="mt-5 inline-flex text-sm font-semibold text-primary transition hover:text-[#164F34]"
          >
            Workspace settings
          </Link>
        </aside>
      </section>

      <section className="rounded-xl border border-[#DDE7DF] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#E8EEE9] px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.035em] text-[#203127]">
              Recent activity
            </h2>
            <p className="mt-1 text-sm text-[#77877C]">
              Important activity from your stores will be collected here.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#86958B]">
            {recentSales.length > 0 ? "Live activity feed" : "No activity yet"}
          </span>
        </div>
        {recentSales.length > 0 ? (
          <div className="divide-y divide-[#E8EEE9]">
            {recentSales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-sm text-[#203127]">
                    Sale <span className="font-semibold">#{sale.receiptNumber}</span>{" "}
                    completed for{" "}
                    <span className="font-bold text-primary">
                      ₱
                      {Number(sale.total || 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                </div>
                <span className="text-xs text-[#77877C]">
                  {sale.completedAt || sale.createdAt
                    ? new Date(
                        sale.completedAt || sale.createdAt,
                      ).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-[#77877C]">
            No client activity has been loaded yet.
          </div>
        )}
      </section>
    </div>
  );
}

function SalesIcon({ className }) {
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
        d="M4 19.5V5.5m0 14h16M7.5 15l3-3 2.5 2.5 4-5"
      />
      <path strokeLinecap="round" d="M14.5 9.5h2.5V12" />
    </svg>
  );
}
function PreviewIcon({ className }) {
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
        d="M12 8v4m0 4h.01M10.3 3.7 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
      />
    </svg>
  );
}
