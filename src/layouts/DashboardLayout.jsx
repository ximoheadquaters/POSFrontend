import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import XimoIcon from '../assets/ximoIcon2.PNG'
const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/clients", label: "Clients" },
  { to: "/admin/systems", label: "Systems" },
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      // Keep the current session visible so the user can retry.
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <span className="font-semibold">Ximo Super Admin</span>
          <button
            className="rounded-button border border-neutral-200 p-2"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle dashboard navigation"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>
      <aside
        className={`${open ? "block" : "hidden"} fixed inset-y-16 left-0 z-20 w-64 border-r border-neutral-200 bg-white px-4 py-6 lg:inset-y-0 lg:block`}
      >
        <NavLink to="/" className="mb-8 hidden items-center gap-3 px-3 lg:flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-white">
            <img src={XimoIcon}/>
          </span>
          <span>
            <span className="block font-semibold">Ximo</span>
            <span className="block text-xs text-neutral-500">Super Admin</span>
          </span>
        </NavLink>
        <nav aria-label="Super Admin">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Platform
          </p>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-button px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute inset-x-4 bottom-5 border-t border-neutral-200 pt-4">
          <p className="truncate px-3 text-sm font-medium text-neutral-800">
            {user?.user_metadata?.display_name ||
              user?.user_metadata?.full_name ||
              user?.email}
          </p>
          <p className="truncate px-3 text-xs text-neutral-400">
            {user?.email}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoading}
            className="mt-3 w-full rounded-button px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
          >
            Sign out
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-10 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
