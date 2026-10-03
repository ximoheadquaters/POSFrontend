import { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import {
  clearAll,
  dismissNotification,
} from "../features/notifications/notificationsSlice";
import PortalShell, { PortalIcon } from "../components/portal/PortalShell";

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { to: "/admin", label: "Overview", icon: "home", end: true },
      { to: "/admin/clients", label: "Clients", icon: "clients" },
    ],
  },
  {
    label: "Ximo POS",
    items: [
      {
        to: "/admin/systems",
        label: "Systems",
        icon: "systems",
        match: (path) => path === "/admin/systems",
      },
      {
        to: "/admin/systems/pos",
        label: "Organizations",
        icon: "pos",
        match: (path) =>
          path === "/admin/pos" ||
          (path.startsWith("/admin/systems/pos") && !path.includes("/plans")),
      },
      {
        to: "/admin/systems/pos/plans",
        label: "Plans & modules",
        icon: "plans",
      },
    ],
  },
  {
    label: "Billing",
    items: [
      { to: "/admin/billing", label: "Billing activity", icon: "billing" },
    ],
  },
];

const searchableSections = [
  {
    to: "/admin",
    label: "Overview",
    description: "Platform activity",
    icon: "home",
  },
  {
    to: "/admin/clients",
    label: "Clients",
    description: "Client records and access",
    icon: "clients",
  },
  {
    to: "/admin/systems",
    label: "Systems",
    description: "Ximo products",
    icon: "systems",
  },
  {
    to: "/admin/systems/pos",
    label: "Organizations",
    description: "POS organizations and subscriptions",
    icon: "pos",
  },
  {
    to: "/admin/systems/pos/plans",
    label: "Plans & modules",
    description: "POS product configuration",
    icon: "plans",
  },
  {
    to: "/admin/billing",
    label: "Billing activity",
    description: "Platform payment activity",
    icon: "billing",
  },
];

function currentSection(pathname) {
  if (pathname.startsWith("/admin/clients")) return "Clients";
  if (pathname.includes("/plans")) return "Plans & modules";
  if (pathname.startsWith("/admin/systems/pos") || pathname === "/admin/pos")
    return "Ximo POS";
  if (pathname.startsWith("/admin/systems")) return "Systems";
  if (pathname.startsWith("/admin/billing")) return "Billing activity";
  return "Overview";
}

export default function DashboardLayout() {
  const { adminPreview = false } = useOutletContext() || {};
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, signOut } = useAuth();
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.items);

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleSignOut() {
    if (adminPreview) {
      navigate("/", { replace: true });
      return;
    }

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      // Keep the workspace visible so the user can retry without losing context.
    }
  }

  const accountName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    "Super admin";
  const accountDetail = user?.email || "Ximo administrator";
  const topActions = (
    <>
      <button
        type="button"
        onClick={() => {
          setSearchOpen(true);
          setNotificationsOpen(false);
        }}
        className="flex h-10 w-[220px] items-center gap-2 rounded-xl border border-[#E4EAE5] bg-[#F8FAF8] px-3 text-left text-xs text-[#748177] transition-colors hover:bg-[#F0F4F2] focus-visible:ring-2 focus-visible:ring-[#1A593B]"
        aria-label="Search admin sections"
      >
        <PortalIcon name="search" className="h-4 w-4" />
        <span className="flex-1">Search sections</span>
        <kbd className="rounded-md border border-[#DDE6DF] bg-white px-1.5 py-0.5 text-[10px] text-[#7B8980]">
          ⌘ K
        </kbd>
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setNotificationsOpen((value) => !value);
            setSearchOpen(false);
          }}
          className="relative grid h-10 w-10 place-items-center rounded-xl text-[#69766D] transition-colors hover:bg-[#F0F4F2] focus-visible:ring-2 focus-visible:ring-[#1A593B]"
          aria-label={`Notifications${notifications.length ? ` (${notifications.length})` : ""}`}
          aria-expanded={notificationsOpen}
        >
          <PortalIcon name="bell" className="h-[18px] w-[18px]" />
          {notifications.length ? (
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#1A593B] ring-2 ring-white" />
          ) : null}
        </button>
        {notificationsOpen ? (
          <NotificationPanel
            notifications={notifications}
            onDismiss={(id) => dispatch(dismissNotification(id))}
            onClear={() => dispatch(clearAll())}
          />
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <PortalShell
        groups={navigationGroups}
        mobileItems={[
          navigationGroups[0].items[0],
          navigationGroups[0].items[1],
          navigationGroups[1].items[1],
          navigationGroups[2].items[0],
        ]}
        sectionTitle={currentSection(location.pathname)}
        sectionSubtitle={
          adminPreview ? "Preview workspace" : "Platform administration"
        }
        workspaceLabel="Admin workspace"
        accountName={adminPreview ? "Preview workspace" : accountName}
        accountDetail={adminPreview ? "Development preview" : accountDetail}
        accountNotice={
          adminPreview ? (
            <p className="rounded-xl border border-[#E8D99E] bg-[#FFF9E7] px-3 py-2 text-xs leading-5 text-[#755A18]">
              Preview mode only. Administrative data stays private.
            </p>
          ) : null
        }
        onSignOut={handleSignOut}
        signOutDisabled={isLoading}
        signOutLabel={adminPreview ? "Exit preview" : "Sign out"}
        topActions={topActions}
        mobileAction={
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B] focus-visible:ring-2 focus-visible:ring-[#1A593B]"
            aria-label="Search admin sections"
          >
            <PortalIcon name="search" className="h-[18px] w-[18px]" />
          </button>
        }
      >
        <Outlet context={{ adminPreview }} />
      </PortalShell>
      {searchOpen ? (
        <SectionSearch
          onClose={() => setSearchOpen(false)}
          onSelect={(section) => {
            navigate(section.to);
            setSearchOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function SectionSearch({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return searchableSections;
    return searchableSections.filter((section) =>
      `${section.label} ${section.description}`.toLowerCase().includes(value),
    );
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 px-3 pt-[max(3rem,12vh)] sm:px-5"
      role="dialog"
      aria-modal="true"
      aria-label="Search admin sections"
      onMouseDown={onClose}
    >
      <section
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#DCE7DE] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#E8EEE9] px-4 sm:px-5">
          <PortalIcon
            name="search"
            className="h-5 w-5 shrink-0 text-[#718076]"
          />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sections"
            className="h-14 min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-[#25352B] outline-none placeholder:text-[#91A095] focus:ring-0"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs font-medium text-[#748177] hover:bg-[#F0F4F2]"
          >
            Close
          </button>
        </div>
        <div className="p-2">
          {results.map((section) => (
            <button
              key={section.to}
              type="button"
              onClick={() => onSelect(section)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#F0F4F2] focus-visible:ring-2 focus-visible:ring-[#1A593B]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B]">
                <PortalIcon name={section.icon} className="h-[17px] w-[17px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#25352B]">
                  {section.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-[#748177]">
                  {section.description}
                </span>
              </span>
            </button>
          ))}
          {!results.length ? (
            <p className="px-3 py-10 text-center text-sm text-[#748177]">
              No matching section.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function NotificationPanel({ notifications, onDismiss, onClear }) {
  return (
    <div className="absolute right-0 top-12 z-30 w-80 overflow-hidden rounded-2xl border border-[#DCE7DE] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between border-b border-[#E8EEE9] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#25352B]">Notifications</p>
          <p className="mt-0.5 text-xs text-[#748177]">
            {notifications.length
              ? `${notifications.length} to review`
              : "No new notifications"}
          </p>
        </div>
        {notifications.length ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-[#1A593B] hover:text-[#164A32]"
          >
            Clear all
          </button>
        ) : null}
      </div>
      {notifications.length ? (
        <ul className="max-h-80 overflow-y-auto divide-y divide-[#EEF2EF]">
          {notifications.map((notification) => (
            <li key={notification.id} className="flex gap-3 px-4 py-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A593B]" />
              <p className="flex-1 text-sm leading-5 text-[#58665D]">
                {notification.message}
              </p>
              <button
                type="button"
                onClick={() => onDismiss(notification.id)}
                className="text-sm text-[#809087] hover:text-[#25352B]"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-[#748177]">
          You are up to date.
        </div>
      )}
    </div>
  );
}
