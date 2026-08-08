import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";

const ADMIN_ROLES = new Set(["super_admin", "super-admin", "superadmin"]);

export default function ClientRoute() {
  const location = useLocation();
  const { isInitialized, isAuthenticated, role } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (ADMIN_ROLES.has(String(role || "").toLowerCase())) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
