// src/apis/AccountAPI.js
const API_BASE = "http://localhost:8080";

/** ---------------- LOGIN ---------------- **/
export async function loginApi(payload) {
  const res = await fetch(`${API_BASE}/account/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = "Đăng nhập thất bại!";
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        msg = data.message || data.error || msg;
      } else msg = await res.text();
    } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  let token = "";

  if (ct.includes("application/json")) {
    const data = await res.json();
    token = data.token || data.jwt || data.access_token || "";
  } else {
    token = (await res.text()).trim();
  }

  if (!token) throw new Error("Không nhận được token từ server!");

  localStorage.setItem("jwt", token);
  window.dispatchEvent(new Event("jwt-changed"));

  return token;
}

/** ---------------- SIGNUP ---------------- **/
export async function signupApi(payload) {
  const res = await fetch(`${API_BASE}/account/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = "Sign up failed!";
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        msg = data.message || data.error || msg;
      } else msg = await res.text();
    } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/** ---------------- DETAIL USER ---------------- **/
export async function getAccountDetail() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    const err = new Error("NO_TOKEN");
    err.code = "NO_TOKEN";
    throw err;
  }

  const res = await fetch(`${API_BASE}/account/detail`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(txt || "UNAOTHORIZED");
    err.status = res.status;
    throw err;
  }

  return res.json();
}

/** ---------------- ACTIVATE ACCOUNT ---------------- **/
export async function activateAccount(email, code) {
  const res = await fetch(
    `${API_BASE}/account/active-account?email=${encodeURIComponent(
      email
    )}&code=${encodeURIComponent(code)}`
  );

  const msg = await res.text();
  return { ok: res.ok, message: msg };
}

/** ---------------- LOGOUT ---------------- **/
export function logout() {
  localStorage.removeItem("jwt");
  window.dispatchEvent(new Event("jwt-changed"));
}
