import { Navigate, Route, Routes } from "react-router-dom";
import { AdminDashboardPage } from "../src/pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminProtectedRoute } from "./routes/AdminProtectedRoute";

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/owner/login" replace />} />
      <Route path="/owner/login" element={<AdminLoginPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/" element={<Navigate to="/owner" replace />} />
        <Route path="/owner/*" element={<AdminDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/owner" replace />} />
    </Routes>
  );
}
