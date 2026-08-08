import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import XimoAdminMark from "../assets/ximo-admin-mark.png";

export default function ClientLayout() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const initial = String(user?.email || "C").trim().charAt(0).toUpperCase() || "C";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      // The auth provider exposes any sign-out problem through its own state.
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-[#000000]">
      <aside className="flex w-[76px] shrink-0 flex-col items-center border-r border-[#1A593B]/15 bg-white py-5 sm:w-60 sm:items-stretch sm:px-4">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A593B]/10">
            <img src={XimoAdminMark} alt="Ximo" className="h-7 w-7 object-contain" />
          </span>
          <span className="hidden text-lg font-semibold text-[#1A593B] sm:block">Ximo</span>
        </div>

        <div className="mt-10 hidden rounded-xl bg-[#1A593B]/5 px-3 py-2.5 sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#386F55]">
            Client workspace
          </p>
        </div>

        <div className="mt-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#386F55] text-sm font-semibold text-white"
            aria-label="Client account"
          >
            {initial}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg p-2 text-[#4C4239] transition hover:bg-[#1A593B]/10 hover:text-[#1A593B] sm:px-3 sm:py-2 sm:text-sm sm:font-medium"
            aria-label="Sign out"
          >
            <span className="sm:hidden" aria-hidden="true">
              ↪
            </span>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1" aria-label="Client workspace">
        <Outlet />
      </main>
    </div>
  );
}
