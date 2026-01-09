const BASE_URL = "http://localhost:8080";

const getJWT = () => localStorage.getItem("jwt");

// fetch có JWT
const fetchWithJWT = async (url, options = {}) => {
  const token = getJWT();
  if (!token) throw new Error("Missing JWT");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  // PATCH có thể trả string -> không parse json
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return await res.text().catch(() => "");
  return res.json();
};

// fetch public
const fetchPublic = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return [];
  return res.json();
};

// map backend -> UI
const mapNoti = (n) => ({
  id: n.notificationId,
  title: "Notification",
  message: n.message,
  time: n.createdAt,
  // backend chưa có read/isRead thì mặc định false
  read: n.read === true || n.isRead === true,
  raw: n,
});

export const getMyNotifications = async (status = "ACTIVE") => {
  const data = await fetchWithJWT(
    `${BASE_URL}/notifications/my?status=${encodeURIComponent(status)}`
  );
  return Array.isArray(data) ? data.map(mapNoti) : [];
};

export const getPublicNotifications = async () => {
  const data = await fetchPublic(`${BASE_URL}/notifications/public/list`);
  return Array.isArray(data) ? data.map(mapNoti) : [];
};

export const markNotificationRead = async (id) => {
  return fetchWithJWT(`${BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
  });
};
