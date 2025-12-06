import { Navigate } from "react-router-dom";
import { getUserFromToken } from "@/utils/auth";

export default function RequireRole({ role, children }) {
  const user = getUserFromToken();

  console.log("Decoded user =", user);

  // 1. Chưa login → trả về trang chủ
  if (!user) return <Navigate to="/" replace />;

  // 2. Token không có role
  if (!user.role) return <Navigate to="/" replace />;

  // 3. Role không khớp
  if (user.role !== role) return <Navigate to="/" replace />;

  // 4. Đúng role → cho vào
  return children;
}
