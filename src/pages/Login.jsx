import { useState } from "react";
import { loginApi } from "@/apis/AccountAPI";

export default function LoginModal({ onClose, onOpenSignup }) {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries()); // { username, password }

    setLoading(true);
    try {
      await loginApi(payload); // -> đã lưu token + dispatch sự kiện
      onClose?.(); // -> đóng modal, Header sẽ tự cập nhật
    } catch (error) {
      setErr(error.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  }

  function handleGoSignup() {
    onClose?.();
    onOpenSignup?.();
  }

  return (
    <div className="w-[92%] max-w-md rounded-2xl bg-white p-6 shadow-2xl relative animate-fadeIn">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        aria-label="Close"
        type="button"
      >
        ✕
      </button>

      {/* Title */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        Sign In to EasyTravel
      </h3>

      {/* Error */}
      {err && <p className="text-sm text-red-600 mb-3">{err}</p>}

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Username */}
        <div className="space-y-1">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-800"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            placeholder="Enter your username"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-800"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter your password"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            autoComplete="current-password"
          />
          <div className="text-right">
            <a href="#" className="text-sm text-orange-500 hover:underline">
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-500 text-white font-semibold py-3 hover:bg-orange-400 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Login with Google */}
        <button
          type="button"
          className="w-full rounded-full border border-gray-300 bg-white py-3 text-gray-700 font-medium hover:bg-gray-50 shadow-sm inline-flex items-center justify-center gap-3 transition"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            className="h-5 w-5"
            alt="Google"
          />
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={handleGoSignup}
            className="font-semibold text-orange-500 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}
