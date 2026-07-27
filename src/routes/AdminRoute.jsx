import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";

const ADMIN_ROLES = new Set(["super_admin", "super-admin", "superadmin"]);

export default function AdminRoute() {
  const location = useLocation();
  const { isInitialized, isAuthenticated, role } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <Spinner size="lg" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!ADMIN_ROLES.has(String(role || "").toLowerCase())) {
    return <Navigate to="/" replace state={{ accessDenied: true }} />;
  }
  return <Outlet />;
}
