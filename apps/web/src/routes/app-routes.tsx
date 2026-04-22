import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardPage } from "../pages/dashboard-page";
import { LoginPage } from "../pages/login-page";
import { RegisterPage } from "../pages/register-page";
import { ProtectedRoute } from "./protected-route";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<RegisterPage />} path="/register" />
      <Route element={<LoginPage />} path="/login" />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardPage />} path="/dashboard" />
      </Route>

      <Route element={<Navigate replace to="/dashboard" />} path="*" />
    </Routes>
  );
};
