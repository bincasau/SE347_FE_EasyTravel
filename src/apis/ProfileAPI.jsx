// src/apis/ProfileAPI.js
const API_BASE = "http://localhost:8080";

export async function updateMyProfileApi({ user, file }) {
  const token = localStorage.getItem("jwt");
  if (!token) throw new Error("NO_TOKEN");

  const fd = new FormData();
  fd.append("user", new Blob([JSON.stringify(user)], { type: "application/json" }));
  if (file) fd.append("file", file);

  const res = await fetch(`${API_BASE}/account/update/my-profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ không set Content-Type khi gửi FormData
    },
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export async function deleteMineApi() {
  const token = localStorage.getItem("jwt");
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_BASE}/account/delete-mine`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return true;
}
