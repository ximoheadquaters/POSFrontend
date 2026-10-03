import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import XimoMark from "../../assets/ximo-admin-mark.png";

function matchesRoute(item, pathname) {
  if (typeof item.match === "function") return item.match(pathname);
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function initialFrom(value) {
  return String(value || "X")
    .trim()
    .charAt(0)
    .toUpperCase();
}

export default function PortalShell({
  children,
  groups,
  mobileItems,
  sectionTitle,
  sectionSubtitle,
  workspaceLabel,
  accountName,
  accountDetail,
  accountNotice,
  onSignOut,
  signOutLabel = "Sign out",
  signOutDisabled = false,
  topActions,
  mobileAction,
}) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const quickItems = useMemo(
    () => (mobileItems || groups.flatMap((group) => group.items)).slice(0, 5),
    [groups, mobileItems],
  );

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const sidebar = (drawer = false) => (
    <aside
      className={`flex h-full flex-col bg-white ${
        drawer
          ? "w-[min(19rem,calc(100vw-2rem))] border-r border-[#DDE8E0] shadow-[16px_0_36px_rgba(15,23,42,0.12)]"
          : "w-64 border-r border-[#DDE8E0]"
      }`}
      aria-label="Workspace navigation"
    >
      <div className="border-b border-[#E6ECE7] px-4 py-4">
        <NavLink
          to={groups[0]?.items?.[0]?.to || "/"}
          className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-[#1A593B] focus-visible:ring-2 focus-visible:ring-[#1A593B]"
          aria-label={`${workspaceLabel} home`}
          onClick={() => setMenuOpen(false)}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EAF2EE]">
            <img src={XimoMark} alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold tracking-[-0.03em] text-[#17241C]">
              Ximo
            </span>
            <span className="block truncate text-[11px] font-medium text-[#738078]">
              {workspaceLabel}
            </span>
          </span>
        </NavLink>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label={workspaceLabel}>
        {groups.map((group, groupIndex) => (
          <section key={group.label || groupIndex} className={groupIndex ? "mt-5" : ""}>
            {group.label ? (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A978E]">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = matchesRoute(item, location.pathname);
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={() => setMenuOpen(false)}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#1A593B] ${
                        active
                          ? "border border-[#DCE8E1] bg-[#EAF2EE] font-semibold text-[#1A593B]"
                          : "border border-transparent font-medium text-[#65736A] hover:bg-[#F0F4F2] hover:text-[#1A593B]"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <PortalIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="border-t border-[#E6ECE7] p-3">
        {accountNotice ? <div className="mb-3">{accountNotice}</div> : null}
        <div className="flex items-center gap-3 rounded-xl border border-[#E5ECE6] bg-[#FCFDFC] px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#1A593B] text-xs font-semibold text-white">
            {initialFrom(accountName || accountDetail)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-[#213127]">{accountName}</span>
            <span className="block truncate text-xs text-[#748177]">{accountDetail}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          disabled={signOutDisabled}
          className="mt-2 flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#637169] transition-colors hover:bg-[#FBEDEC] hover:text-[#A13E35] disabled:opacity-50"
        >
          <PortalIcon name="sign-out" className="h-[17px] w-[17px]" />
          {signOutLabel}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="portal-shell min-h-screen overflow-x-hidden bg-[#F8F9FA] text-[#211D1A]">
      <div className="fixed inset-y-0 left-0 z-30 hidden min-[1100px]:block">{sidebar()}</div>

      <main className="min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom))] min-[640px]:pb-0 min-[1100px]:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-[#E2E8E3] bg-white px-3 py-2 min-[1100px]:hidden sm:px-5">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0F4F2] text-[#1A593B] transition-colors hover:bg-[#EAF2EE] focus-visible:ring-2 focus-visible:ring-[#1A593B]"
            aria-label="Open navigation menu"
          >
            <PortalIcon name="menu" className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold tracking-[-0.025em] text-[#17241C]">
              {sectionTitle}
            </p>
            {sectionSubtitle ? (
              <p className="truncate text-xs text-[#738078]">{sectionSubtitle}</p>
            ) : null}
          </div>
          {mobileAction || (
            <button
              type="button"
              onClick={() => setAccountOpen((value) => !value)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#1A593B] text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-[#1A593B]"
              aria-label="Open account options"
              aria-expanded={accountOpen}
            >
              {initialFrom(accountName || accountDetail)}
            </button>
          )}
        </header>

        <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-[#E2E8E3] bg-white px-8 min-[1100px]:flex xl:px-10">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#25352B]">{sectionTitle}</p>
            {sectionSubtitle ? <p className="mt-0.5 truncate text-xs text-[#78867C]">{sectionSubtitle}</p> : null}
          </div>
          {topActions ? <div className="ml-5 flex shrink-0 items-center gap-2">{topActions}</div> : null}
        </header>

        <div className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-6 sm:py-6 min-[1100px]:px-8 min-[1100px]:py-8 xl:px-10">
          {children}
        </div>
      </main>

      <nav
        aria-label="Primary workspace destinations"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#DEE7E0] bg-white px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_12px_rgba(15,23,42,0.04)] sm:hidden"
      >
        <ul className={`mx-auto grid max-w-lg gap-1 ${quickItems.length === 4 ? "grid-cols-4" : quickItems.length === 3 ? "grid-cols-3" : "grid-cols-5"}`}>
          {quickItems.map((item) => {
            const active = matchesRoute(item, location.pathname);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] transition-colors ${
                    active ? "bg-[#EAF2EE] font-semibold text-[#1A593B]" : "font-medium text-[#647168] hover:bg-[#F0F4F2]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <PortalIcon name={item.icon} className="h-[18px] w-[18px]" />
                  <span className="max-w-full truncate">{item.shortLabel || item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex bg-black/30 min-[1100px]:hidden" role="presentation">
          {sidebar(true)}
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="min-w-0 flex-1 cursor-default"
            aria-label="Close navigation menu"
          />
        </div>
      ) : null}

      {accountOpen ? (
        <div className="fixed inset-0 z-40 bg-black/20 min-[1100px]:hidden" onClick={() => setAccountOpen(false)}>
          <section
            className="absolute inset-x-3 bottom-20 rounded-2xl border border-[#DEE7E0] bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.14)]"
            aria-label="Account options"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1A593B] text-sm font-semibold text-white">
                {initialFrom(accountName || accountDetail)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#213127]">{accountName}</p>
                <p className="truncate text-xs text-[#748177]">{accountDetail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              disabled={signOutDisabled}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#E8C7C3] bg-[#FBEDEC] px-4 text-sm font-semibold text-[#A13E35] disabled:opacity-50"
            >
              <PortalIcon name="sign-out" className="h-[17px] w-[17px]" />
              {signOutLabel}
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function PortalIcon({ name, className = "" }) {
  const shared = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "1.8", className, "aria-hidden": true };
  switch (name) {
    case "clients":
    case "customers":
      return <svg {...shared}><circle cx="9" cy="8" r="3" /><path strokeLinecap="round" d="M3.8 20c.7-3.4 2.5-5.2 5.2-5.2s4.5 1.8 5.2 5.2M16.5 5.5a2.6 2.6 0 0 1 0 5.1M16 15.1c2.1.5 3.5 2.1 4.1 4.9" /></svg>;
    case "systems":
    case "inventory":
      return <svg {...shared}><path strokeLinecap="round" strokeLinejoin="round" d="m4 7.5 8-4 8 4-8 4-8-4Zm0 4.5 8 4 8-4m-16 4.5 8 4 8-4" /></svg>;
    case "pos":
      return <svg {...shared}><rect x="4" y="3.5" width="16" height="17" rx="2" /><path strokeLinecap="round" d="M7.5 7.5h9M7.5 11h9M8 16h3M15 16h1" /></svg>;
    case "plans":
    case "billing":
      return <svg {...shared}><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path strokeLinecap="round" d="M2.5 10.5h19M6.5 14.5h3" /></svg>;
    case "reports":
      return <svg {...shared}><path strokeLinecap="round" strokeLinejoin="round" d="M5 20.5V10.8m7 9.7V3.5m7 17V14.3" /><path strokeLinecap="round" d="M3.5 20.5h17" /></svg>;
    case "branches":
      return <svg {...shared}><path strokeLinecap="round" strokeLinejoin="round" d="M4 20V9.5l8-5 8 5V20M8 20v-5h8v5M9 10h.01M15 10h.01" /></svg>;
    case "settings":
      return <svg {...shared}><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="m19.4 15 .1 1.6-2.1 2.1-1.7-.6a7.7 7.7 0 0 1-1.5.6L13.5 20h-3l-.7-1.3a7.7 7.7 0 0 1-1.5-.6l-1.7.6-2.1-2.1.1-1.6a7.7 7.7 0 0 1-.6-1.5L2.7 13v-3l1.3-.7a7.7 7.7 0 0 1 .6-1.5l-.1-1.6 2.1-2.1 1.7.6a7.7 7.7 0 0 1 1.5-.6l.7-1.3h3l.7 1.3a7.7 7.7 0 0 1 1.5.6l1.7-.6 2.1 2.1-.1 1.6a7.7 7.7 0 0 1 .6 1.5l1.3.7v3l-1.3.7a7.7 7.7 0 0 1-.6 1.5Z" /></svg>;
    case "search":
      return <svg {...shared}><circle cx="10.8" cy="10.8" r="5.8" /><path strokeLinecap="round" d="m15.2 15.2 4 4" /></svg>;
    case "bell":
      return <svg {...shared}><path strokeLinecap="round" strokeLinejoin="round" d="M18 10.3a6 6 0 0 0-12 0c0 7-2.5 7-2.5 8.5h17C20.5 17.3 18 17.3 18 10.3ZM10 21h4" /></svg>;
    case "menu":
      return <svg {...shared}><path strokeLinecap="round" d="M4 6.5h16M4 12h16M4 17.5h16" /></svg>;
    case "sign-out":
      return <svg {...shared}><path strokeLinecap="round" strokeLinejoin="round" d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10M14 8l4 4-4 4M8 12h10" /></svg>;
    case "home":
    default:
      return <svg {...shared}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>;
  }
}
