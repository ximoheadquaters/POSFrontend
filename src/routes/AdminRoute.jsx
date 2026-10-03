import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";

const ADMIN_ROLES = new Set(["super_admin", "super-admin", "superadmin"]);
// Keep the local design preview usable when a backend or Supabase is not
// running. Vite replaces DEV with false in production, so it cannot grant
// access to the admin workspace in a deployed build.
const ALLOW_ADMIN_WORKSPACE_PREVIEW = import.meta.env.DEV;

export default function AdminRoute() {
  const location = useLocation();
  const { isInitialized, isAuthenticated, role } = useAuth();
  const isPreview = !isAuthenticated && ALLOW_ADMIN_WORKSPACE_PREVIEW;

  if (!isInitialized && !isPreview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <Spinner size="lg" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }
  if (!isAuthenticated && !isPreview) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!isPreview && !ADMIN_ROLES.has(String(role || "").toLowerCase())) {
    return <Navigate to="/" replace state={{ accessDenied: true }} />;
  }
  return <Outlet context={{ adminPreview: isPreview }} />;
}
