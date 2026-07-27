import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute() {
  const location = useLocation();
  const { isInitialized, isAuthenticated } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
