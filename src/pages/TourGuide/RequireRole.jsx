import { Navigate, useLocation } from "react-router-dom";
import { getCachedUser } from "@/utils/auth";

export default function RequireRole({ role, children }) {
  const user = getCachedUser();
  const location = useLocation();

  console.log("Decoded user =", user);

  // 1️⃣ Chưa login → về trang chủ
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // 2️⃣ Có token nhưng không có role → 403
  if (!user.role) {
    return <Navigate to="/403" replace />;
  }

  // 3️⃣ Role không khớp → 403
  if (user.role !== role) {
    return <Navigate to="/403" replace />;
  }

  // 4️⃣ Đúng role → cho vào
  return children;
}
