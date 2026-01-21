// src/utils/auth.js
// ✅ HttpOnly cookie => JS không đọc được token
// => FE chỉ dùng auth-flag + cached user từ localStorage

const AUTH_FLAG_KEY = "auth-flag";
const AUTH_USER_KEY = "auth-user";

/**
 * Token helpers (legacy)
 * - setToken/clearToken giữ lại để không crash các chỗ cũ (ví dụ OAuth token in URL)
 * - Nhưng với HttpOnly cookie, setToken/getToken sẽ không còn ý nghĩa
 */
export function getToken() {
  // HttpOnly cookie không đọc được => luôn return ""
  return "";
}

export function setToken(_token) {
  // No-op: HttpOnly cookie phải set từ backend
}

export function clearToken() {
  // No-op: HttpOnly cookie phải clear từ backend (/account/logout)
}

/** ---------- Auth flag (UI quick check) ---------- **/
export function setAuthFlag() {
  try {
    localStorage.setItem(AUTH_FLAG_KEY, "1");
  } catch {}
}

export function clearAuthFlag() {
  try {
    localStorage.removeItem(AUTH_FLAG_KEY);
  } catch {}
}

export function isLoggedIn() {
  try {
    return localStorage.getItem(AUTH_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

/** ---------- Cached user ---------- **/
export function setCachedUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_USER_KEY);
      return;
    }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {}
}

export function getCachedUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCachedUser() {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {}
}

/**
 * Legacy: getUserFromToken()
 * - Trước đây decode JWT để lấy role/username
 * - Giờ không còn token trên FE => trả cached user (nếu có) hoặc null
 */
export function getUserFromToken() {
  return getCachedUser();
}
