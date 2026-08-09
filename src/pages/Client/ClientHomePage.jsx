import { Link, useOutletContext } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const overviewCards = [
  { label: "Income", detail: "Waiting for POS sales data" },
  { label: "Sales", detail: "Waiting for POS sales data" },
  { label: "Transactions", detail: "Waiting for POS sales data" },
];

const setupItems = [
  ["Sales feed", "Connects daily sales and income to this dashboard."],
  ["Reports", "Makes daily, weekly, and monthly reporting available."],
  ["Branches", "Keeps each business location in one shared workspace."],
];

export default function ClientHomePage() {
  const { clientPreview = false } = useOutletContext() || {};
  const { user } = useAuth();
  const firstName = String(
    user?.user_metadata?.display_name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "there",
  ).split(/[\s@]/)[0];

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
              —
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
              No data connected
            </span>
          </div>
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
                <p className="mt-1 text-xs leading-5 text-[#77877C]">
                  {detail}
                </p>
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
            No activity yet
          </span>
        </div>
        <div className="px-6 py-10 text-center text-sm text-[#77877C]">
          No client activity has been loaded yet.
        </div>
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
