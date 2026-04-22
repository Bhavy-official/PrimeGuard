import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingScreen } from "../components/loading-screen";
import { useAuth } from "../hooks/use-auth";

export const ProtectedRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
};
