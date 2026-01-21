// src/apis/AccountAPI.js
import {
  clearAuthFlag,
  clearCachedUser,
  clearToken, // có thể không còn dùng nhưng giữ cho tương thích project
  setAuthFlag,
  setCachedUser,
  setToken, // có thể không còn dùng nhưng giữ cho tương thích project
} from "@/utils/auth";

const API_BASE = "http://localhost:8080";

/** ---------------- HELPERS ---------------- **/
async function readErrorMessage(res, fallbackMsg) {
  let msg = fallbackMsg;
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } else {
      const text = await res.text();
      msg = text || msg;
    }
  } catch {}
  return msg;
}

/** ---------------- LOGIN ---------------- **/
export async function loginApi(payload) {
  const res = await fetch(`${API_BASE}/account/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ để nhận cookie jwt từ BE
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await readErrorMessage(res, "Đăng nhập thất bại!");
    throw new Error(msg);
  }

  // ✅ cookie httpOnly => FE không đọc token nữa
  // nếu backend trả json thì đọc message cho vui, không bắt buộc
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      await res.json().catch(() => null);
    } else {
      await res.text().catch(() => "");
    }
  } catch {}

  // ✅ đánh dấu đã auth (UI) và bắn event refresh
  setAuthFlag();
  window.dispatchEvent(new Event("jwt-changed"));

  return true;
}

/** ---------------- SIGNUP ---------------- **/
export async function signupApi(payload) {
  const res = await fetch(`${API_BASE}/account/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await readErrorMessage(res, "Sign up failed!");
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/** ---------------- DETAIL USER ---------------- **/
export async function getAccountDetail() {
  const res = await fetch(`${API_BASE}/account/detail`, {
    method: "GET",
    credentials: "include", // ✅ gửi cookie jwt lên
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const err = new Error(txt || "UNAUTHORIZED");
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  setCachedUser(data);
  setAuthFlag();
  return data;
}

/** ---------------- CHANGE PASSWORD ---------------- **/
export async function changePasswordApi({ oldPassword, newPassword }) {
  const res = await fetch(`${API_BASE}/account/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!res.ok) {
    const msg = await readErrorMessage(res, "Đổi mật khẩu thất bại!");
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/** ---------------- ACTIVATE ACCOUNT ---------------- **/
export async function activateAccount(email, code) {
  const res = await fetch(
    `${API_BASE}/account/active-account?email=${encodeURIComponent(
      email
    )}&code=${encodeURIComponent(code)}`
  );

  const msg = await res.text().catch(() => "");
  return { ok: res.ok, message: msg };
}

/** ---------------- FORGOT PASSWORD (NO JWT) ---------------- **/
// Step 1: Request reset code to email
export async function forgotPasswordRequestApi(email) {
  const res = await fetch(
    `${API_BASE}/account/forgot-password/request?email=${encodeURIComponent(
      email
    )}`,
    { method: "POST" }
  );

  if (!res.ok) {
    const msg = await readErrorMessage(res, "Gửi mã reset thất bại!");
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await res.json();
    return data.message || data.result || "Đã gửi mã xác nhận về email!";
  }
  return (await res.text().catch(() => "")) || "Đã gửi mã xác nhận về email!";
}

// Step 2: Confirm code + set new password
export async function forgotPasswordConfirmApi({ email, code, newPassword }) {
  const url =
    `${API_BASE}/account/forgot-password/confirm` +
    `?email=${encodeURIComponent(email)}` +
    `&code=${encodeURIComponent(code)}` +
    `&newPassword=${encodeURIComponent(newPassword)}`;

  const res = await fetch(url, { method: "POST" });

  if (!res.ok) {
    const msg = await readErrorMessage(res, "Xác nhận reset thất bại!");
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await res.json();
    return data.message || data.result || "Đổi mật khẩu thành công!";
  }
  return (await res.text().catch(() => "")) || "Đổi mật khẩu thành công!";
}

/** ---------------- LOGOUT ---------------- **/
export async function logout() {
  // ✅ quan trọng: gọi endpoint KHÔNG redirect (để khỏi CORS)
  try {
    await fetch(`${API_BASE}/account/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {}

  // ✅ Clear local flags/cache (token local không còn dùng nhưng clear cho sạch)
  clearToken?.();
  clearCachedUser?.();
  clearAuthFlag?.();

  window.dispatchEvent(new Event("jwt-changed"));
}
