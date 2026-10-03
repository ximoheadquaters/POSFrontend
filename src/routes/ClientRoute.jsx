import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";

const ADMIN_ROLES = new Set(["super_admin", "super-admin", "superadmin"]);
// TODO: Remove this temporary route preview once the client workspace is
// connected to the tenant-scoped POS data API. It never ships in production.
const ALLOW_CLIENT_WORKSPACE_PREVIEW = import.meta.env.DEV;

export default function ClientRoute() {
  const location = useLocation();
  const { isInitialized, isAuthenticated, role } = useAuth();

  // The local workspace preview is intentionally available without a remote
  // session so product and responsive QA never depend on Supabase being online.
  // Production still waits for the session check before granting workspace access.
  const isPreview = !isAuthenticated && ALLOW_CLIENT_WORKSPACE_PREVIEW;

  if (!isInitialized && !isPreview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated && !isPreview) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (ADMIN_ROLES.has(String(role || "").toLowerCase())) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet context={{ clientPreview: isPreview }} />;
}
