import { useOutletContext } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

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

  if (section === "settings") {
    return <SettingsPage clientPreview={clientPreview} user={user} />;
  }

  const page = content[section] || content.reports;
  const Icon = page.icon;

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
        <span className="w-fit rounded-full bg-[#F1F5F1] px-3 py-1.5 text-xs font-semibold text-[#68786D]">
          Placeholder workspace
        </span>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#DDE7DF] bg-white">
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

function SettingsPage({ clientPreview, user }) {
  const accountName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    "Client account";
  const accountEmail = user?.email || "Development preview";

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
              <dd className="text-sm font-semibold text-[#27392C]">Client</dd>
            </div>
          </dl>
        </section>
        <aside className="rounded-xl border border-[#DDE7DF] bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Plan & billing
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-[#27392C]">
            Billing controls are ready to be connected.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#77877C]">
            Your subscription, invoices, and plan options will appear in this
            space.
          </p>
          <p className="mt-5 text-sm font-semibold text-primary">
            Placeholder for subscription controls
          </p>
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
