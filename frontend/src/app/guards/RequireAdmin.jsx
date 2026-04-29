import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  selectAuthLoading,
  selectCanAccessAdmin,
  selectIsAuthenticated,
} from "@/features/auth/authSelectors";
import Loader from "@/shared/components/Loader";

function RequireAdmin({
  children,
  redirectToLogin = "/login",
  redirectToUnauthorized = "/",
}) {
  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const canAccessAdmin = useSelector(selectCanAccessAdmin);
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !canAccessAdmin && !hasNotifiedRef.current) {
      toast.error("Ban khong co quyen truy cap trang nay");
      hasNotifiedRef.current = true;
    }
  }, [canAccessAdmin, isAuthenticated, loading]);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectToLogin} replace />;
  }

  if (!canAccessAdmin) {
    return <Navigate to={redirectToUnauthorized} replace />;
  }

  return children;
}

export default RequireAdmin;
