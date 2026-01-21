import { getToken } from "@/utils/auth";

const API_BASE = "http://localhost:8080";

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function listUrl(type, ownerId) {
  if (type === "hotel") return `${API_BASE}/hotels/${ownerId}/images`;
  if (type === "tour") return `${API_BASE}/tours/${ownerId}/images`;
  if (type === "blog") return `${API_BASE}/blogs/${ownerId}/images`;
  throw new Error("type must be: hotel | tour | blog");
}

export async function getExtras({ type, id }) {
  const res = await fetch(listUrl(type, id), {
    method: "GET",
    credentials: "include",
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`getExtras failed: ${res.status}`);

  const data = await res.json();
  return data?._embedded?.images ?? [];
}


export async function uploadExtra({ type, id, file }) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", type);
  fd.append("id", id);

  const res = await fetch(`${API_BASE}/image/auth/upload`, {
    method: "POST",
    credentials: "include",
    headers: { ...getAuthHeaders() },
    body: fd,
  });

  if (!res.ok) throw new Error(`uploadExtra failed: ${res.status}`);
  return res.json();
}

export async function deleteExtra(imageId) {
  const res = await fetch(`${API_BASE}/image/auth/${imageId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`deleteExtra failed: ${res.status}`);
  return res;
}
