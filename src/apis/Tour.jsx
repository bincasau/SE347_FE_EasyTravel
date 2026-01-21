// =====================================
// 📌 FILE: src/apis/TourAPI.js
// 📌 Chứa toàn bộ API sử dụng cho Tour
// =====================================
import { adminSendNotificationToUsers } from "@/apis/NotificationAPI";
import { getToken } from "@/utils/auth";
const API_BASE = "http://localhost:8080";

/**
 * ========================================================
 * 🔍 1. Tìm tour theo tên (không phân biệt hoa thường)
 * API: /tours/search/findByTitleContainingIgnoreCase
 * ========================================================
 */
export async function searchByTitle(keyword) {
  const url = `${API_BASE}/tours/search/findByTitleContainingIgnoreCase?keyword=${encodeURIComponent(
    keyword,
  )}`;

  const res = await fetch(url);
  return res.json();
}

/**
 * ========================================================
 * 📍 2. Tìm theo địa điểm xuất phát (departureLocation)
 * API: /tours/search/findByDepartureLocation
 * ========================================================
 */
export async function searchByLocation(location) {
  const safe = String(location ?? "").trim();
  const url = `${API_BASE}/tours/search/findByDepartureLocation?departureLocation=${encodeURIComponent(
    safe,
  )}`;

  const res = await fetch(url);
  return res.json();
}

/**
 * ========================================================
 * ⏳ 3. Tìm theo số ngày tour (durationDays)
 * API: /tours/search/findByDurationDays
 * ========================================================
 */
export async function searchByDuration(days) {
  const url = `${API_BASE}/tours/search/findByDurationDays?durationDays=${days}`;

  const res = await fetch(url);
  return res.json();
}

/**
 * ========================================================
 * 📅 4. Tìm tour có startDate >= ngày chọn (có phân trang + sort)
 * API:
 * /tours/search/findByStartDateGreaterThanEqual{?startDate,page,size,sort*}
 * ========================================================
 */
export async function searchByStartDate(
  date,
  page = 0,
  size = 8,
  sort = "startDate,asc",
) {
  const params = new URLSearchParams();
  params.set("startDate", String(date ?? "").trim());
  params.set("page", String(page));
  params.set("size", String(size));
  if (sort) params.set("sort", sort);

  const url = `${API_BASE}/tours/search/findByStartDateGreaterThanEqual?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTours(page, size, sort) {
  const url = `${API_BASE}/tours?page=${page}&size=${size}&sort=${sort}`;
  const res = await fetch(url);
  return res.json();
}

export async function getDepartureLocations() {
  try {
    const res = await fetch(`${API_BASE}/tours/departure-locations`);
    if (!res.ok) throw new Error("Failed to fetch departure locations");

    const data = await res.json();

    if (!Array.isArray(data)) return [];
    return data.map((x) => String(x ?? "").trim()).filter((x) => x.length > 0);
  } catch (error) {
    console.error("API getDepartureLocations error:", error);
    return [];
  }
}

export async function getAllTours(sort) {
  let allTours = [];
  let url = `${API_BASE}/tours`;
  if (sort) url += `?sort=${encodeURIComponent(sort)}`;

  try {
    while (url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tours");

      const data = await res.json();

      const toursInPage = data._embedded?.tours || [];
      allTours = allTours.concat(toursInPage);

      const nextLink = data._links?.next?.href;
      if (nextLink) {
        url = nextLink.startsWith("http") ? nextLink : `${API_BASE}${nextLink}`;
      } else {
        url = null;
      }
    }

    return allTours;
  } catch (error) {
    console.error("API getAllTours error:", error);
    return [];
  }
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJsonPublic(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function fetchJsonAuth(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTourFullById(id) {
  const [tour, itRes, imgRes, tgRes] = await Promise.all([
    fetchJsonPublic(`${API_BASE}/tours/${id}`),
    fetchJsonPublic(`${API_BASE}/tours/${id}/itineraries`),
    fetchJsonPublic(`${API_BASE}/tours/${id}/images`),
    fetchJsonPublic(`${API_BASE}/tours/${id}/tourGuides`),
  ]);

  return {
    tour,
    itineraries: itRes?._embedded?.itineraries ?? [],
    images: imgRes?._embedded?.images ?? [],
    tourGuides: tgRes?._embedded?.users ?? [],
  };
}

export async function saveTourUpsert(tour, file, guideIds) {
  const formData = new FormData();

  formData.append(
    "tour",
    new Blob([JSON.stringify(tour)], { type: "application/json" }),
  );

  if (file) formData.append("file", file);

  return fetchJsonAuth(`${API_BASE}/admin/tour/save?guideIds=${guideIds}`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteTour(tourId) {
  const res = await fetch(`${API_BASE}/admin/tour/${tourId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) throw new Error(await res.text());
  return true;
}

export async function getTourParticipants(tourId) {
  const res = await fetch(`${API_BASE}/admin/tour/${tourId}/participants`, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMonthlyTourStats(month, year) {
  const res = await fetch(
    `${API_BASE}/admin/tour/monthly?month=${month}&year=${year}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        ...getAuthHeaders(),
        Accept: "application/json",
      },
    },
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function filterTours({
  keyword = "",
  startDate = "",
  durationDay = "", // backend key durationDay
  departureLocation = "",
  status = "Activated",
  page = 0,
  size = 8,
  sort = "startDate,asc",
} = {}) {
  const params = new URLSearchParams();

  const k = String(keyword ?? "").trim();
  const sd = String(startDate ?? "").trim();
  const dur = String(durationDay ?? "").trim();
  const dep = String(departureLocation ?? "").trim();
  const st = String(status ?? "").trim();

  if (k) params.set("keyword", k);
  if (sd) params.set("startDate", sd);

  // durationDay có thể là "" hoặc số
  if (dur !== "") params.set("durationDay", dur);

  // ✅ TRIM departureLocation (fix case "Hà Nội ")
  if (dep) params.set("departureLocation", dep);

  // ✅ luôn gửi status nếu có
  if (st) params.set("status", st);

  params.set("page", String(page));
  params.set("size", String(size));
  if (sort) params.set("sort", sort);

  const url = `${API_BASE}/tours/search/filterTours?${params.toString()}`;

  // ✅ debug nhanh (bạn mở console sẽ thấy url gọi gì)
  console.log("[filterTours] URL =", url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function readJsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  const txt = await res.text();
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(txt);
    } catch {
      return txt;
    }
  }
  return txt;
}

// lấy tour title từ GET /tours/{id}
async function getTourTitle(tourId) {
  try {
    const res = await fetch(`${API_BASE}/tours/${tourId}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const data = await readJsonOrText(res);
    if (!res.ok) return "";
    return data?.title ?? "";
  } catch {
    return "";
  }
}

export async function adminCancelTourSideEffects(tourId) {
  const tourTitle = await getTourTitle(tourId);

  const participants = await getTourParticipants(tourId);
  if (!Array.isArray(participants) || participants.length === 0) return;

  const successBookings = participants.filter((p) => p?.status === "Success");

  const userIds = Array.from(
    new Set(
      successBookings
        .map((p) => p?.user?.userId)
        .filter((id) => id !== null && id !== undefined),
    ),
  );

  const bookingIds = Array.from(
    new Set(
      successBookings
        .map((p) => p?.bookingId)
        .filter((id) => id !== null && id !== undefined),
    ),
  );

  const msg = tourTitle
    ? `Tour "${tourTitle}" đã bị hủy. Hệ thống sẽ tự động hoàn tiền cho đơn đặt tour của bạn.`
    : "Tour bạn đã đăng ký đã bị hủy. Hệ thống sẽ tự động hoàn tiền cho đơn đặt tour của bạn.";

  // 1) notify
  if (userIds.length > 0) {
    const notifRes = await adminSendNotificationToUsers(msg, userIds);
    console.log("notify result:", notifRes);
  }

  // 2) refund từng booking
  for (const bookingId of bookingIds) {
    const res = await fetch(`${API_BASE}/payment/refund/TOUR/${bookingId}`, {
      method: "POST",
      credentials: "include",
      headers: { ...getAuthHeaders(), Accept: "application/json" },
    });

    const data = await readJsonOrText(res);

    if (!res.ok) {
      console.error("refund failed:", { bookingId, status: res.status, data });
      throw new Error(
        typeof data === "string"
          ? data
          : data?.message || `Refund failed for bookingId=${bookingId}`,
      );
    }

    console.log("refund ok:", bookingId, data);
  }
}

export async function searchToursByKeyword(keyword) {
  const k = String(keyword ?? "").trim();
  if (!k) return [];

  const url = `${API_BASE}/tours/search/filterTours?keyword=${encodeURIComponent(k)}`;
  console.log("[searchToursByKeyword] URL =", url);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  return data?._embedded?.tours ?? [];
}

export async function copyTour(tourId) {
  const id = Number(tourId);
  if (!id) throw new Error("tourId không hợp lệ");

  const url = `${API_BASE}/admin/tour/copy/${id}`;
  console.log("[copyTour] URL =", url);

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
      Accept: "application/json",
    },
  });

  const data = await readJsonOrText(res);
  if (!res.ok) {
    throw new Error(
      typeof data === "string" ? data : data?.message || "Copy tour failed",
    );
  }

  return data;
}
