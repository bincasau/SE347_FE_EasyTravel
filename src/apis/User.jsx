// src/apis/UserAPI.js
import { getToken } from "@/utils/auth";
const API_BASE = "http://localhost:8080";

function getAuthHeaders() {
  const token = getToken();
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
    new Blob([JSON.stringify(user)], { type: "application/json" }),
  );
  if (file) fd.append("file", file);
  return fd;
}

export async function getAllUsers(page = 0, size = 20) {
  const res = await fetch(`${API_BASE}/users?page=${page}&size=${size}`, {
    method: "GET",
    credentials: "include",
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
    credentials: "include",
    headers: getAuthHeaders(),
  });

  return readJsonOrText(res);
}

export async function adminCreateUser(user, file) {
  console.log("api", user, file);
  const res = await fetch(`${API_BASE}/admin/users/save`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: buildUserFormData(user, file),
  });
  return readJsonOrText(res);
}

export async function adminUpdateUser(id, user, file) {
  const res = await fetch(`${API_BASE}/admin/users/update/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: getAuthHeaders(),
    body: buildUserFormData(user, file),
  });
  return readJsonOrText(res);
}

export async function adminDeleteUser(id) {
  const res = await fetch(`${API_BASE}/admin/users/delete/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const data = await readJsonOrText(res);
  return data || true;
}

export async function getUserById(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
      Accept: "application/json",
    },
  });

  return await readJsonOrText(res);
}

export async function fetchUsers({ keyword = "", page = 0, size = 10 } = {}) {
  const kw = (keyword || "").trim();

  const params = new URLSearchParams({
    page,
    size,
  });

  if (kw) {
    params.append("username", kw);
    params.append("name", kw);
  }

  const url = `${API_BASE}/users/search/findByUsernameContainingOrNameContaining?${params.toString()}`;
  console.log("fetchUsers url:", url);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch users failed: ${res.status}`);
  }

  const data = await res.json();
  console.log("fetchUsers data:", data);
  return data;
}
