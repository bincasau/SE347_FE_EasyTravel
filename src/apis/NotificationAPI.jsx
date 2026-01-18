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
  // an toàn hơn: ưu tiên notificationId, fallback id
  id: n.notificationId ?? n.id,
  title: n.title ?? "Notification",
  message: n.message,
  time: n.createdAt ?? n.time,
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

/**
 * ✅ NEW: Dùng cho cái chuông
 * - Luôn lấy broadcast/public
 * - Nếu có JWT thì lấy thêm my/private
 * - Merge theo id, ưu tiên read=true nếu 1 trong 2 bên read
 * - Sort mới nhất trước
 */
export const getBellNotifications = async (status = "ACTIVE") => {
  const token = getJWT();

  const [publicList, myList] = await Promise.all([
    getPublicNotifications().catch(() => []),
    token ? getMyNotifications(status).catch(() => []) : Promise.resolve([]),
  ]);

  // merge theo id
  const map = new Map();

  const put = (n) => {
    if (!n?.id) return;
    const old = map.get(n.id);
    if (!old) {
      map.set(n.id, n);
      return;
    }
    // merge read + giữ time/title/message mới nhất (ưu tiên data có raw đầy đủ)
    map.set(n.id, {
      ...old,
      ...n,
      read: Boolean(old.read) || Boolean(n.read),
      raw: n.raw ?? old.raw,
    });
  };

  publicList.forEach(put);
  myList.forEach(put);

  const merged = Array.from(map.values());

  // sort desc theo time
  merged.sort((a, b) => {
    const ta = new Date(a.time || a.raw?.createdAt || 0).getTime();
    const tb = new Date(b.time || b.raw?.createdAt || 0).getTime();
    return (tb || 0) - (ta || 0);
  });

  return merged;
};

function getAuthHeaders() {
  const token = localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Broadcast notification
export async function adminBroadcastNotification(message) {
  const res = await fetch(
    `${BASE_URL}/admin/notif/broadcast?message=${encodeURIComponent(message)}`,
    { method: "POST", headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Update notification status
export async function adminUpdateNotificationStatus(id, status) {
  const res = await fetch(
    `${BASE_URL}/admin/notif/${id}/status?status=${status}`,
    { method: "PATCH", headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

// Delete notification
export async function adminDeleteNotification(id) {
  const res = await fetch(`${BASE_URL}/admin/notif/delete/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

// Send notification to specific users
export async function adminSendNotificationToUsers(message, userIds = []) {
  const params = new URLSearchParams();
  params.append("message", message);
  userIds.forEach((id) => params.append("userIds", id));
  const res = await fetch(
    `${BASE_URL}/admin/notif/send-to-specific?${params.toString()}`,
    { method: "POST", headers: getAuthHeaders() }
  );
  return res.text();
}

// Get all notifications (admin)
export async function adminGetAllNotifications({
  status,
  isBroadcast,
  search,
  targetUser,
} = {}) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (isBroadcast !== undefined) params.append("isBroadcast", isBroadcast);
  if (search) params.append("search", search);
  if (targetUser) params.append("targetUser", targetUser);

  const res = await fetch(`${BASE_URL}/admin/notif/all?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
