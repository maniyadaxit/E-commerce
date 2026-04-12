import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../../src/components/ui/Spinner";
import { useAuth } from "../../src/hooks/useAuth";

export function AdminProtectedRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="section-shell flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user || user.role !== "OWNER") {
    return <Navigate to="/owner/login" replace />;
  }

  return <Outlet />;
}
