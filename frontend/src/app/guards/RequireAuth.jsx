import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import {
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";
import Loader from "@/shared/components/Loader";

function RequireAuth({ children, element, redirectTo = "/login" }) {
  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ?? element;
}

export default RequireAuth;
