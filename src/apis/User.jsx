const API_BASE = "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("jwt");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getAllUsers(page = 0, size = 20) {
  const res = await fetch(`${API_BASE}/users?page=${page}&size=${size}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/**
 * @param {Object} params
 * @param {number} params.page   UI page (1-based)
 * @param {number} params.size
 * @param {string} params.role   ADMIN | TOUR_GUIDE | HOTEL_MANAGER | CUSTOMER | ALL
 * @param {string} params.status ACTIVE | INACTIVE | ALL
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

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
