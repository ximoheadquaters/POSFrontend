import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";

const ADMIN_ROLES = new Set(["super_admin", "super-admin", "superadmin"]);

export default function PublicRoute() {
  const { isInitialized, isAuthenticated, role } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (isAuthenticated) {
    const destination = ADMIN_ROLES.has(String(role || "").toLowerCase())
      ? "/admin"
      : "/client";
    return <Navigate to={destination} replace />;
  }
  return <Outlet />;
}
