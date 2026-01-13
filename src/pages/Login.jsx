import { useState } from "react";
import { loginApi, resetPasswordApi } from "@/apis/AccountAPI";
import { getUserFromToken } from "@/utils/auth";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ onClose, onOpenSignup }) {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const navigate = useNavigate();

  // ✅ Google login: redirect sang backend OAuth2 endpoint
  function handleGoogleLogin() {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    setLoading(true);

    try {
      // ⭐ Gọi API để đăng nhập → backend trả JWT → FE tự lưu vào localStorage
      await loginApi(payload);

      // ⭐ Giải mã JWT lấy role
      const user = getUserFromToken();
      console.log("Decoded user:", user);

      // ⭐ Đóng modal
      onClose?.();

      // ⭐ Điều hướng theo role
      if (user?.role === "HOTEL_MANAGER") {
        navigate("/hotel-manager/hotels/addroom");
      } else if (user?.role === "TOUR_GUIDE") {
        navigate("/guide/schedule");
      } else if (user?.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      // ⭐ Báo cho app biết JWT đã thay đổi
      window.dispatchEvent(new Event("jwt-changed"));
    } catch (error) {
      setErr(error?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setErr("");
    setResetting(true);
    try {
      // ⚠️ Backend hiện tại yêu cầu Principal => phải có JWT mới reset được
      const msg = await resetPasswordApi();
      alert(msg || "Reset password thành công!");
    } catch (e) {
      if (e?.code === "NO_TOKEN") {
        setErr(
          "Chức năng reset password hiện tại yêu cầu bạn đăng nhập trước (backend đang dùng Principal)."
        );
      } else {
        setErr(e?.message || "Reset password thất bại!");
      }
    } finally {
      setResetting(false);
    }
  }

  function handleGoSignup() {
    onClose?.();
    onOpenSignup?.();
  }

  return (
    <div className="w-[92%] max-w-md rounded-2xl bg-white p-6 shadow-2xl relative animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        aria-label="Close"
        type="button"
      >
        ✕
      </button>

      <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        Sign In to EasyTravel
      </h3>

      {err && <p className="text-sm text-red-600 mb-3">{err}</p>}

      {/* ✅ Button Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full rounded-full border border-gray-300 bg-white text-gray-900 font-semibold py-3 hover:bg-gray-50 transition flex items-center justify-center gap-2 mb-4"
      >
        <span>G</span>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-800">Username</label>
          <input
            name="username"
            type="text"
            required
            placeholder="Enter your username"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-800">Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="Enter your password"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* ✅ Forgot password */}
        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetting}
            className="text-sm font-semibold text-orange-500 hover:underline disabled:opacity-60"
          >
            {resetting ? "Resetting..." : "Forgot password?"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-500 text-white font-semibold py-3 hover:bg-orange-400 transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?
          <button
            type="button"
            onClick={handleGoSignup}
            className="font-semibold text-orange-500 hover:underline ml-1"
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}
