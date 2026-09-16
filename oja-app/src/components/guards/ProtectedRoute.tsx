import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppHref } from "@/routes/constants";
import { AppLoader } from "../loaders/AppLoader";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"Authenticating..."} />
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={AppHref.unauthorizedRoute} replace />
  );
}
