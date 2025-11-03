// src/apis/LoginAPI.js
const API_BASE = "http://localhost:8080"; // Đổi nếu BE khác port

/**
 * Đăng nhập và lưu JWT vào localStorage.
 * Tự phát sự kiện 'jwt-changed' để Header re-fetch user.
 * @param {{ username: string, password: string }} payload
 * @returns {Promise<string>} JWT token
 */
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
      } else {
        const text = await res.text();
        msg = text || msg;
      }
    } catch {}
    throw new Error(msg);
  }

  // Hỗ trợ cả JSON lẫn text
  const ct = res.headers.get("content-type") || "";
  let token = "";
  if (ct.includes("application/json")) {
    const data = await res.json();
    token =
      data.token ||
      data.access_token ||
      data.jwt ||
      (typeof data === "string" ? data : "");
  } else {
    token = (await res.text())?.trim();
  }

  if (!token) throw new Error("Không nhận được token từ server!");

  localStorage.setItem("jwt", token);
  window.dispatchEvent(new Event("jwt-changed")); // báo cho Header

  return token;
}

export function logout() {
  localStorage.removeItem("jwt");
  window.dispatchEvent(new Event("jwt-changed"));
}
