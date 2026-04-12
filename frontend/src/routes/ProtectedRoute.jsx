import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ roles }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="section-shell flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/account/login" replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
