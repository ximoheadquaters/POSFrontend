import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import XimoAdminMark from "../assets/ximo-admin-mark.png";
import {
  clearAll,
  dismissNotification,
} from "../features/notifications/notificationsSlice";

const links = [
  { to: "/admin", label: "Overview", end: true, icon: OverviewIcon },
  { to: "/admin/clients", label: "Clients", icon: ClientsIcon },
  { to: "/admin/systems", label: "Systems", icon: SystemsIcon },
];

const searchableSections = [
  { to: "/admin", label: "Overview", description: "Platform activity and operational summary", icon: OverviewIcon },
  { to: "/admin/clients", label: "Clients", description: "Client records and connected systems", icon: ClientsIcon },
  { to: "/admin/systems", label: "Systems", description: "Available Ximo products", icon: SystemsIcon },
  { to: "/admin/systems/pos", label: "Ximo POS", description: "Organizations, subscriptions, and modules", icon: PosIcon },
];

function currentSection(pathname) {
  if (pathname.startsWith("/admin/clients")) return "Clients";
  if (pathname.startsWith("/admin/systems/pos")) return "Ximo POS";
  if (pathname.startsWith("/admin/systems")) return "Systems";
  return "Overview";
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
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
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      // Keep the current session visible so the user can retry.
    }
  }

  return (
    <div className="admin-workspace min-h-screen bg-[#F7F8FA] text-[#252B3A]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E9ECF0] bg-white px-4 lg:hidden">
        <NavLink to="/admin" className="flex items-center gap-2" aria-label="Ximo admin overview">
          <span className="grid h-8 w-8 place-items-center">
            <img src={XimoAdminMark} alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="text-sm font-semibold">Ximo Admin</span>
        </NavLink>
        <div className="flex items-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#E2E6EB] bg-white text-[#596273]" onClick={() => setSearchOpen(true)} aria-label="Search admin sections">
            <SearchIcon className="h-4 w-4" />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#E2E6EB] bg-white text-[#596273]" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle dashboard navigation">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </header>

      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[78px] flex-col items-center border-r border-[#E9ECF0] bg-white py-4 shadow-[10px_0_35px_rgba(31,39,52,0.04)] transition-transform duration-300 lg:translate-x-0`}>
        <NavLink to="/admin" className="grid h-10 w-10 place-items-center rounded-xl transition hover:bg-[#F4F6F7]" aria-label="Ximo admin overview" title="Ximo admin overview">
          <img src={XimoAdminMark} alt="" className="h-8 w-8 object-contain" />
        </NavLink>
        <nav aria-label="Super Admin" className="mt-10">
          <ul className="space-y-3">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `group grid h-10 w-10 place-items-center rounded-xl transition ${isActive ? "bg-primary text-white shadow-[0_8px_18px_rgba(26,89,59,0.18)]" : "text-[#9AA2AD] hover:bg-[#F4F6F7] hover:text-[#4F5867]"}`}
                    aria-label={link.label}
                    title={link.label}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="sr-only">{link.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#F0F2F4] text-xs font-bold text-[#596273]" title={user?.email || "Super admin"}>
            {(user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email || "A").slice(0, 1).toUpperCase()}
          </span>
          <button type="button" onClick={handleSignOut} disabled={isLoading} className="grid h-9 w-9 place-items-center rounded-lg text-[#9AA2AD] transition hover:bg-[#FCECEA] hover:text-[#A13E35] disabled:opacity-50" aria-label="Sign out" title="Sign out">
            <SignOutIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>

      {open && <button className="fixed inset-0 z-30 bg-[#252B3A]/25 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" />}

      <main className="lg:pl-[78px]">
        <div className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-[#E9ECF0] bg-white/95 px-8 backdrop-blur lg:flex xl:px-10">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-[#252B3A]">{currentSection(location.pathname)}</p>
            <span className="h-4 w-px bg-[#E0E4E8]" />
            <p className="text-xs text-[#9AA2AD]">Ximo admin workspace</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { setSearchOpen(true); setNotificationsOpen(false); }} className="flex h-9 w-[230px] items-center gap-2 rounded-lg bg-[#F7F8FA] px-3 text-left text-xs text-[#9AA2AD] transition hover:bg-[#F0F2F4]" aria-label="Search admin sections">
              <SearchIcon className="h-4 w-4" />
              <span className="flex-1">Search sections</span>
              <kbd className="hidden rounded border border-[#E0E4E8] bg-white px-1.5 py-0.5 text-[10px] text-[#A3ABB5] xl:inline">⌘ K</kbd>
            </button>
            <div className="relative">
              <button type="button" onClick={() => { setNotificationsOpen((value) => !value); setSearchOpen(false); }} className="relative grid h-9 w-9 place-items-center rounded-lg text-[#7F8793] transition hover:bg-[#F3F5F6] hover:text-[#303746]" aria-label={`Notifications${notifications.length ? ` (${notifications.length})` : ""}`} aria-expanded={notificationsOpen}>
                <BellIcon className="h-[18px] w-[18px]" />
                {notifications.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-white" />}
              </button>
              {notificationsOpen && <NotificationPanel notifications={notifications} onDismiss={(id) => dispatch(dismissNotification(id))} onClear={() => dispatch(clearAll())} />}
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F0F2F4] text-xs font-bold text-[#596273]">{(user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email || "A").slice(0, 1).toUpperCase()}</span>
          </div>
        </div>
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">
          <Outlet />
        </div>
      </main>
      {searchOpen && <SectionSearch onClose={() => setSearchOpen(false)} onSelect={(section) => { navigate(section.to); setSearchOpen(false); }} />}
    </div>
  );
}

function SectionSearch({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return searchableSections;
    return searchableSections.filter((section) => `${section.label} ${section.description}`.toLowerCase().includes(value));
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#252B3A]/20 px-4 pt-[14vh] backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Search admin sections" onMouseDown={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E2E6EB] bg-white shadow-[0_24px_70px_rgba(31,39,52,0.18)]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[#EEF0F2] px-5">
          <SearchIcon className="h-5 w-5 shrink-0 text-[#8B94A0]" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sections…" className="h-14 min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-[#303746] outline-none placeholder:text-[#A3ABB5] focus:ring-0" />
          <button type="button" onClick={onClose} className="rounded-md border border-[#E2E6EB] px-2 py-1 text-[11px] font-medium text-[#8B94A0] hover:bg-[#F3F5F6]">ESC</button>
        </div>
        <div className="p-2">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A3ABB5]">Jump to</p>
          {results.map((section) => { const Icon = section.icon; return <button key={section.to} type="button" onClick={() => onSelect(section)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#F3F5F6]"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#F0F2F4] text-[#697382]"><Icon className="h-[17px] w-[17px]" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#303746]">{section.label}</span><span className="mt-0.5 block truncate text-xs text-[#8B94A0]">{section.description}</span></span><span className="text-[#A3ABB5]" aria-hidden="true">→</span></button>; })}
          {!results.length && <p className="px-3 py-10 text-center text-sm text-[#8B94A0]">No admin sections match “{query}”.</p>}
        </div>
      </div>
    </div>
  );
}

function NotificationPanel({ notifications, onDismiss, onClear }) {
  return <div className="absolute right-0 top-11 z-30 w-80 overflow-hidden rounded-2xl border border-[#E2E6EB] bg-white shadow-[0_18px_55px_rgba(31,39,52,0.16)]"><div className="flex items-center justify-between border-b border-[#EEF0F2] px-4 py-3"><div><p className="text-sm font-semibold text-[#303746]">Notifications</p><p className="mt-0.5 text-xs text-[#9AA2AD]">{notifications.length ? `${notifications.length} in your inbox` : "You’re all caught up"}</p></div>{notifications.length > 0 && <button type="button" onClick={onClear} className="text-xs font-semibold text-primary hover:text-primary-700">Clear all</button>}</div>{notifications.length ? <ul className="max-h-80 overflow-y-auto divide-y divide-[#F0F2F4]">{notifications.map((notification) => <li key={notification.id} className="flex gap-3 px-4 py-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><p className="flex-1 text-sm leading-5 text-[#596273]">{notification.message}</p><button type="button" onClick={() => onDismiss(notification.id)} className="text-[#A3ABB5] transition hover:text-[#596273]" aria-label="Dismiss notification">×</button></li>)}</ul> : <div className="px-4 py-8 text-center"><BellIcon className="mx-auto h-5 w-5 text-[#B0B7C0]" /><p className="mt-3 text-sm font-medium text-[#596273]">Nothing new right now.</p></div>}</div>;
}

function OverviewIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>; }
function ClientsIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3" /><path strokeLinecap="round" d="M3.8 20c.7-3.4 2.5-5.2 5.2-5.2s4.5 1.8 5.2 5.2M16.5 5.5a2.6 2.6 0 0 1 0 5.1M16 15.1c2.1.5 3.5 2.1 4.1 4.9" /></svg>; }
function SystemsIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19.5 8v8L12 20.5 4.5 16V8L12 3.5Z" /><path strokeLinecap="round" d="m4.8 8 7.2 4.2L19.2 8M12 12.2v8" /></svg>; }
function PosIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="3.5" width="16" height="17" rx="2" /><path strokeLinecap="round" d="M7.5 7.5h9M7.5 11h9M8 16h3M15 16h1" /></svg>; }
function SearchIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="5.8" /><path strokeLinecap="round" d="m15.2 15.2 4 4" /></svg>; }
function BellIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M18 10.3a6 6 0 0 0-12 0c0 7-2.5 7-2.5 8.5h17C20.5 17.3 18 17.3 18 10.3ZM10 21h4" /></svg>; }
function SignOutIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10M14 8l4 4-4 4M8 12h10" /></svg>; }
