// src/apis/UserAPI.js
const API_BASE = "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readJsonOrText(res) {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildUserFormData(user, file) {
  const fd = new FormData();
  fd.append(
    "user",
    new Blob([JSON.stringify(user)], { type: "application/json" })
  );
  if (file) fd.append("file", file);
  return fd;
}

export async function getAllUsers(page = 0, size = 20) {
  const res = await fetch(`${API_BASE}/users?page=${page}&size=${size}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return readJsonOrText(res);
}

/**
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.size
 * @param {string} params.role
 * @param {string} params.status
 */
export async function getUsers({
  page = 1,
  size = 20,
  role = "ALL",
  status = "ALL",
}) {
  const page0 = Math.max(0, page - 1);

  const qp = new URLSearchParams();
  qp.set("page", String(page0));
  qp.set("size", String(size));
  qp.set("sort", "userId,asc");

  const hasRole = role && role !== "ALL";
  const hasStatus = status && status !== "ALL";

  let url = "";

  if (hasRole && hasStatus) {
    qp.set("role", role);
    qp.set("status", status);
    url = `${API_BASE}/users/search/findByRoleAndStatus?${qp.toString()}`;
  } else if (hasRole) {
    qp.set("role", role);
    url = `${API_BASE}/users/search/findByRole?${qp.toString()}`;
  } else if (hasStatus) {
    qp.set("status", status);
    url = `${API_BASE}/users/search/findByStatus?${qp.toString()}`;
  } else {
    url = `${API_BASE}/users?${qp.toString()}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return readJsonOrText(res);
}

export async function adminCreateUser(user, file) {
  console.log("api", user, file);
  const res = await fetch(`${API_BASE}/admin/users/save`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: buildUserFormData(user, file),
  });
  return readJsonOrText(res);
}

export async function adminUpdateUser(id, user, file) {
  const res = await fetch(`${API_BASE}/admin/users/update/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: buildUserFormData(user, file),
  });
  return readJsonOrText(res);
}

export async function adminDeleteUser(id) {
  const res = await fetch(`${API_BASE}/admin/users/delete/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await readJsonOrText(res);
  return data || true;
}

export async function getUserById(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      Accept: "application/json",
    },
  });

  return await readJsonOrText(res);
}

