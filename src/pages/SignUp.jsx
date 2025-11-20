import { useState } from "react";
import { signupApi } from "@/apis/LoginAPI";

export default function SignupModal({ onClose, onOpenLogin }) {
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle password visibility
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setSuccess("");

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    // 1️⃣ Kiểm tra password match
    if (payload.password !== payload.confirmPassword) {
      setErr("Passwords do not match!");
      return;
    }

    delete payload.confirmPassword; // BE không cần field này

    setLoading(true);
    try {
      await signupApi(payload);
      setSuccess("Đăng ký thành công! Vui lòng kiểm tra email.");
    } catch (error) {
      setErr(error.message || "Sign up failed!");
    } finally {
      setLoading(false);
    }
  }

  function handleSwitchToLogin() {
    onClose?.();
    onOpenLogin?.();
  }

  return (
    <div className="w-[92%] max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl relative animate-fadeIn">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 text-center">
        Create your account
      </h3>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Sign up to start your journey with EasyTravel.
      </p>

      {/* Error */}
      {err && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg mb-3 text-center">
          {err}
        </p>
      )}

      {/* Success */}
      {success && (
        <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg mb-3 text-center">
          {success}
        </p>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name" name="name" />
          <Field label="Email" name="email" type="email" />
        </div>

        {/* Phone + Username */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Phone number" name="phoneNumber" required={false} />
          <Field label="Username" name="username" />
        </div>

        {/* Password + confirm password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PASSWORD WITH EYE */}
          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-gray-800">
              Password
            </label>
            <input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Create a password"
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5"
            />
            <span
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-10 cursor-pointer text-gray-500 hover:text-gray-700"
            ></span>
          </div>

          {/* CONFIRM PASSWORD WITH EYE */}
          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-gray-800">
              Confirm password
            </label>
            <input
              name="confirmPassword"
              type={showConfirmPass ? "text" : "password"}
              placeholder="Re-enter your password"
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5"
            />
            <span
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-4 top-10 cursor-pointer text-gray-500 hover:text-gray-700"
            ></span>
          </div>
        </div>

        {/* DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Date of birth" name="dob" type="date" />
          <Field label="Address" name="address" required={false} />
        </div>

        {/* Gender */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-800">Gender</label>
          <select
            name="gender"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5"
          >
            <option value="">Select gender</option>
            <option value="F">Female</option>
            <option value="M">Male</option>
            <option value="O">Other</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-500 text-white font-semibold py-3 hover:bg-orange-400 transition disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <div className="flex items-center gap-3 pt-1">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={handleSwitchToLogin}
            className="font-semibold text-orange-500 hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

/* Reusable Field component */
function Field({ label, name, type = "text", placeholder, required = true }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5"
      />
    </div>
  );
}
