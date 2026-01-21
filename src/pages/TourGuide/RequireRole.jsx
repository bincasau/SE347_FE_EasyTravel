import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCachedUser } from "@/utils/auth";

export default function RequireRole({ role, children }) {
  const location = useLocation();

  const user = useMemo(() => getCachedUser(), []);

  // Chưa login → về trang chủ
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Có token nhưng không có role → 403
  if (!user.role) {
    return <Navigate to="/403" replace />;
  }

  // Role không khớp → 403
  if (user.role !== role) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
