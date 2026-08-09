import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import useAuth from "../hooks/useAuth";
import XimoAdminMark from "../assets/ximo-admin-mark.png";

const workspaceLinks = [
  { to: "/client", label: "Dashboard", end: true, icon: DashboardIcon },
  { to: "/client/reports", label: "Reports", icon: ReportsIcon },
  { to: "/client/branches", label: "Branches", icon: BranchesIcon },
  { to: "/client/inventory", label: "Inventory", icon: InventoryIcon },
  { to: "/client/customers", label: "Customers", icon: CustomersIcon },
];

const utilityLinks = [
  { to: "/client/settings", label: "Settings", icon: SettingsIcon },
];

function sectionTitle(pathname) {
  if (pathname.startsWith("/client/reports")) return "Reports";
  if (pathname.startsWith("/client/branches")) return "Branches";
  if (pathname.startsWith("/client/inventory")) return "Inventory";
  if (pathname.startsWith("/client/customers")) return "Customers";
  if (pathname.startsWith("/client/settings")) return "Settings";
  return "Dashboard";
}

export default function ClientLayout() {
  const { clientPreview = false } = useOutletContext() || {};
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, isLoading } = useAuth();
  const accountName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    "Client account";
  const accountEmail = user?.email || "Development preview";
  const initial =
    String(accountName || accountEmail || "C")
      .trim()
      .charAt(0)
      .toUpperCase() || "C";

  async function handleSignOut() {
    if (clientPreview) {
      navigate("/", { replace: true });
      return;
    }

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      // Keep the current workspace visible so the client can retry.
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-[#1A2C21]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-[#DDE7DF] bg-white px-4 py-5 lg:flex">
        <NavLink
          to="/client"
          className="flex items-center gap-3 rounded-xl px-2 py-2"
          aria-label="Ximo client dashboard"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F1EA]">
            <img
              src={XimoAdminMark}
              alt=""
              className="h-7 w-7 object-contain"
            />
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-[-0.04em] text-primary">
              Ximo
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B8A80]">
              Client workspace
            </span>
          </span>
        </NavLink>

        <p className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#91A095]">
          Workspace
        </p>
        <nav className="mt-3" aria-label="Client workspace">
          <ul className="space-y-1">
            {workspaceLinks.map((item) => (
              <NavigationLink key={item.to} item={item} />
            ))}
          </ul>
        </nav>

        <div className="mt-7 border-t border-[#E5ECE6] pt-5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#91A095]">
            Account
          </p>
          <nav className="mt-3" aria-label="Account settings">
            <ul className="space-y-1">
              {utilityLinks.map((item) => (
                <NavigationLink key={item.to} item={item} />
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-auto border-t border-[#E5ECE6] pt-4">
          {clientPreview && (
            <p className="mb-3 rounded-lg bg-[#FFF8E6] px-3 py-2 text-xs leading-5 text-[#755A18]">
              Development preview. No client data is loaded.
            </p>
          )}
          <div className="flex items-center gap-3 px-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#22342A]">
                {clientPreview ? "Preview workspace" : accountName}
              </p>
              <p className="truncate text-xs text-[#7B8A80]">{accountEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoading}
            className="mt-3 flex min-h-[40px] w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#526257] transition hover:bg-[#F1F5F1] hover:text-primary disabled:opacity-50"
          >
            <SignOutIcon className="h-[17px] w-[17px]" />
            {clientPreview ? "Exit preview" : "Sign out"}
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#DDE7DF] bg-white px-5 lg:hidden">
        <NavLink
          to="/client"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="Ximo client dashboard"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E8F1EA]">
            <img
              src={XimoAdminMark}
              alt=""
              className="h-6 w-6 object-contain"
            />
          </span>
          <span className="truncate text-[17px] font-semibold tracking-[-0.03em] text-primary">
            {sectionTitle(location.pathname)}
          </span>
        </NavLink>
        <NavLink
          to="/client/settings"
          className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white"
          title={accountEmail}
          aria-label="Open workspace settings"
        >
          {initial}
        </NavLink>
      </header>

      <main className="min-w-0 pb-24 lg:pl-[252px] lg:pb-0">
        <div className="hidden h-16 items-center justify-between border-b border-[#DDE7DF] bg-white px-8 lg:flex xl:px-10">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-[#23342A]">
              {sectionTitle(location.pathname)}
            </p>
            <span className="h-4 w-px bg-[#DDE7DF]" />
            <p className="text-xs text-[#7B8A80]">Your Ximo workspace</p>
          </div>
          {clientPreview && (
            <span className="rounded-full bg-[#FFF8E6] px-3 py-1.5 text-xs font-semibold text-[#755A18]">
              Development preview
            </span>
          )}
        </div>
        <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
          <Outlet context={{ clientPreview }} />
        </div>
      </main>

      <nav
        aria-label="Mobile client workspace"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#DDE7DF] bg-white px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_22px_rgba(21,71,47,0.06)] lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {workspaceLinks.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold transition ${isActive ? "bg-[#E8F1EA] text-primary" : "text-[#718076] hover:bg-[#F1F5F1]"}`
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function NavigationLink({ item }) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-[#E8F1EA] text-primary" : "text-[#5F7065] hover:bg-[#F3F7F3] hover:text-primary"}`
        }
      >
        <Icon className="h-[18px] w-[18px]" />
        <span>{item.label}</span>
      </NavLink>
    </li>
  );
}

function DashboardIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
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
function SettingsIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.4 15 .1 1.6-2.1 2.1-1.7-.6a7.7 7.7 0 0 1-1.5.6L13.5 20h-3l-.7-1.3a7.7 7.7 0 0 1-1.5-.6l-1.7.6-2.1-2.1.1-1.6a7.7 7.7 0 0 1-.6-1.5L2.7 13v-3l1.3-.7a7.7 7.7 0 0 1 .6-1.5l-.1-1.6 2.1-2.1 1.7.6a7.7 7.7 0 0 1 1.5-.6l.7-1.3h3l.7 1.3a7.7 7.7 0 0 1 1.5.6l1.7-.6 2.1 2.1-.1 1.6a7.7 7.7 0 0 1 .6 1.5l1.3.7v3l-1.3.7a7.7 7.7 0 0 1-.6 1.5Z"
      />
    </svg>
  );
}
function SignOutIcon({ className }) {
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
        d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10m4-11 4 4-4 4M8 12h10"
      />
    </svg>
  );
}
