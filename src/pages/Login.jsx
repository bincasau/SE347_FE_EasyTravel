import { useState, useMemo } from "react";
import {
  loginApi,
  getAccountDetail,
  forgotPasswordRequestApi,
  forgotPasswordConfirmApi,
} from "@/apis/AccountAPI";
import { getUserFromToken } from "@/utils/auth";
import { useNavigate } from "react-router-dom";
import { popup } from "@/utils/popup";

/** ===== Password Rules =====
 * - >= 8 chars
 * - at least 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
function validatePassword(password) {
  if (!password || password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 chữ thường (a-z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 số (0-9).";
  }
  if (!/[!@#$%^&*(),.?\":{}|<>_\-+=/\\[\]~`;'@]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: !@#$%^&*).";
  }
  return "";
}

export default function LoginModal({ onClose, onOpenSignup }) {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpCode, setFpCode] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");
  const [fpConfirmPass, setFpConfirmPass] = useState(""); // ✅ NEW
  const [fpStep, setFpStep] = useState(1); // 1=request, 2=confirm
  const [resetting, setResetting] = useState(false);

  const navigate = useNavigate();

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
      await loginApi(payload);

      let user = getUserFromToken();
      if (!user) {
        try {
          user = await getAccountDetail();
        } catch {}
      }

      onClose?.();

      if (user?.role === "HOTEL_MANAGER")
        navigate("/hotel-manager/hotels/addroom");
      else if (user?.role === "TOUR_GUIDE") navigate("/guide/schedule");
      else if (user?.role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/");

      window.dispatchEvent(new Event("jwt-changed"));
    } catch (error) {
      const msg = error?.message || "Đăng nhập thất bại!";
      setErr(msg);
      await popup.error(msg, "Đăng nhập thất bại"); // ✅ popup khi login fail
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotRequest() {
    setErr("");
    setResetting(true);

    try {
      const msg = await forgotPasswordRequestApi(fpEmail);

      await popup.success(msg || "Đã gửi mã xác nhận về email!", "Thành công");

      // ✅ sang step 2 và clear code/newPass/confirm cho sạch
      setFpStep(2);
      setFpCode("");
      setFpNewPass("");
      setFpConfirmPass("");
    } catch (e) {
      const msg = e?.message || "Gửi mã reset thất bại!";
      setErr(msg);
      await popup.error(msg, "Thất bại");
    } finally {
      setResetting(false);
    }
  }

  // ✅ validate new password realtime
  const pwdError = useMemo(() => {
    if (!showForgot || fpStep !== 2) return "";
    return validatePassword(fpNewPass);
  }, [showForgot, fpStep, fpNewPass]);

  // ✅ validate confirm password realtime
  const confirmError = useMemo(() => {
    if (!showForgot || fpStep !== 2) return "";
    if (!fpConfirmPass) return "";
    return fpNewPass === fpConfirmPass ? "" : "Mật khẩu xác nhận không khớp.";
  }, [showForgot, fpStep, fpNewPass, fpConfirmPass]);

  async function handleForgotConfirm() {
    setErr("");

    const msgErr = validatePassword(fpNewPass);
    if (msgErr) {
      setErr(msgErr);
      await popup.error(msgErr, "Thất bại");
      return;
    }

    if (!fpConfirmPass || fpNewPass !== fpConfirmPass) {
      const msg = "Mật khẩu xác nhận không khớp.";
      setErr(msg);
      await popup.error(msg, "Thất bại");
      return;
    }

    setResetting(true);
    try {
      const msg = await forgotPasswordConfirmApi({
        email: fpEmail,
        code: fpCode,
        newPassword: fpNewPass,
      });

      await popup.success(msg || "Đổi mật khẩu thành công!", "Thành công");

      // ✅ xong thì quay về login
      setShowForgot(false);
      setFpStep(1);
      setFpEmail("");
      setFpCode("");
      setFpNewPass("");
      setFpConfirmPass("");
      setErr("");
    } catch (e) {
      const msg = e?.message || "Xác nhận reset thất bại!";
      setErr(msg);
      await popup.error(msg, "Thất bại");
    } finally {
      setResetting(false);
    }
  }

  function handleGoSignup() {
    onClose?.();
    onOpenSignup?.();
  }

  const disableResetBtn =
    resetting ||
    !fpEmail ||
    (fpStep === 2 &&
      (!fpCode ||
        !fpNewPass ||
        !fpConfirmPass ||
        !!pwdError ||
        fpNewPass !== fpConfirmPass));

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
        {showForgot ? "Reset Password" : "Sign In to EasyTravel"}
      </h3>

      {err && <p className="text-sm text-red-600 mb-3">{err}</p>}

      {!showForgot ? (
        <>
          {/* ✅ LOGIN FORM */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">
                Username
              </label>
              <input
                name="username"
                type="text"
                required
                placeholder="Enter your username"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setFpStep(1);
                  setErr("");
                  setFpEmail("");
                  setFpCode("");
                  setFpNewPass("");
                  setFpConfirmPass("");
                }}
                className="text-sm font-semibold text-orange-500 hover:underline"
              >
                Forgot password?
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

          {/* ✅ GOOGLE LOGIN Ở DƯỚI CÙNG */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full rounded-full border border-gray-300 bg-white text-gray-900 font-semibold py-3 hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <span>G</span>
            Continue with Google
          </button>
        </>
      ) : (
        <div className="space-y-4">
          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800">Email</label>
            <input
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              type="email"
              required
              disabled={fpStep === 2}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100 disabled:text-gray-500"
            />

            {fpStep === 2 && (
              <button
                type="button"
                className="text-xs font-semibold text-gray-500 hover:underline mt-2"
                onClick={() => {
                  setFpStep(1);
                  setFpCode("");
                  setFpNewPass("");
                  setFpConfirmPass("");
                  setErr("");
                }}
              >
                Change email
              </button>
            )}
          </div>

          {fpStep === 2 && (
            <>
              {/* CODE */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-800">Code</label>
                <input
                  value={fpCode}
                  onChange={(e) => setFpCode(e.target.value)}
                  type="text"
                  required
                  placeholder="Enter code from email"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* NEW PASS */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-800">
                  New password
                </label>
                <input
                  value={fpNewPass}
                  onChange={(e) => setFpNewPass(e.target.value)}
                  type="password"
                  required
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* CONFIRM PASS */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-800">
                  Confirm password
                </label>
                <input
                  value={fpConfirmPass}
                  onChange={(e) => setFpConfirmPass(e.target.value)}
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-orange-400"
                />
                {fpConfirmPass && confirmError && (
                  <p className="text-xs text-red-600 mt-1">{confirmError}</p>
                )}
              </div>

              {/* PASSWORD RULES */}
              <div className="text-xs text-gray-500 space-y-1 mt-1">
                <p className="font-medium text-gray-600">Yêu cầu mật khẩu:</p>
                <ul className="list-disc ml-5">
                  <li>Ít nhất 8 ký tự</li>
                  <li>Có chữ hoa (A-Z)</li>
                  <li>Có chữ thường (a-z)</li>
                  <li>Có số (0-9)</li>
                  <li>Có ký tự đặc biệt (ví dụ: !@#$%^&*)</li>
                </ul>
                {fpNewPass && pwdError && (
                  <p className="text-red-600 mt-1">{pwdError}</p>
                )}
              </div>
            </>
          )}

          {/* ACTION BUTTON */}
          <button
            type="button"
            disabled={disableResetBtn}
            onClick={fpStep === 1 ? handleForgotRequest : handleForgotConfirm}
            className="w-full rounded-full bg-orange-500 text-white font-semibold py-3 hover:bg-orange-400 transition disabled:opacity-60"
          >
            {resetting
              ? "Processing..."
              : fpStep === 1
              ? "Send reset code"
              : "Confirm & change password"}
          </button>

          <button
            type="button"
            className="w-full text-sm font-semibold text-gray-500 hover:underline"
            onClick={() => {
              setShowForgot(false);
              setFpStep(1);
              setErr("");
              setFpEmail("");
              setFpCode("");
              setFpNewPass("");
              setFpConfirmPass("");
            }}
          >
            Back to sign in
          </button>
        </div>
      )}
    </div>
  );
}
