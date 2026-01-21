const TOKEN_COOKIE = "jwt";
const AUTH_FLAG_KEY = "auth-flag";
const AUTH_USER_KEY = "auth-user";
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getCookie(name) {
  const pairs = document.cookie ? document.cookie.split("; ") : [];
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx);
    if (key === name) return decodeURIComponent(pair.slice(idx + 1));
  }
  return "";
}

export function getToken() {
  return getCookie(TOKEN_COOKIE);
}

export function setToken(token, { maxAge = DEFAULT_MAX_AGE_SECONDS } = {}) {
  if (!token) return;
  const encoded = encodeURIComponent(token);
  document.cookie = `${TOKEN_COOKIE}=${encoded}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearToken() {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

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

export function isLoggedIn() {
  try {
    return localStorage.getItem(AUTH_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const jsonPayload = atob(payloadBase64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}
