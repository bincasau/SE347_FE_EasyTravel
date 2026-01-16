// =====================================
// 📌 FILE: src/apis/TourAPI.js
// 📌 Chứa toàn bộ API sử dụng cho Tour
// =====================================
import { adminSendNotificationToUsers } from "@/apis/NotificationAPI";
const API_BASE = "http://localhost:8080";

/**
 * ========================================================
 * 🔍 1. Tìm tour theo tên (không phân biệt hoa thường)
 * API: /tours/search/findByTitleContainingIgnoreCase
 * ========================================================
 */
export async function searchByTitle(keyword) {
  const url = `${API_BASE}/tours/search/findByTitleContainingIgnoreCase?keyword=${encodeURIComponent(
    keyword
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
  const url = `${API_BASE}/tours/search/findByDepartureLocation?departureLocation=${encodeURIComponent(
    location
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
 * 📅 4. Tìm tour có startDate >= ngày chọn
 * API: /tours/search/findByStartDateGreaterThanEqual
 * ========================================================
 */
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
  sort = "startDate,asc"
) {
  const params = new URLSearchParams();
  params.set("startDate", date);
  params.set("page", String(page));
  params.set("size", String(size));

  // sort có thể là: "startDate,asc" | "priceAdult,desc" | "percentDiscount,desc" ...
  if (sort) params.set("sort", sort);

  const url = `${API_BASE}/tours/search/findByStartDateGreaterThanEqual?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * ========================================================
 * 📄 5. Lấy tour mặc định (có phân trang + sort)
 * API: /tours?page=0&size=8&sort=recent
 * ========================================================
 */
export async function getTours(page, size, sort) {
  const url = `${API_BASE}/tours?page=${page}&size=${size}&sort=${sort}`;

  const res = await fetch(url);
  return res.json();
}

export async function getDepartureLocations() {
  try {
    const res = await fetch("http://localhost:8080/tours/departure-locations");
    if (!res.ok) {
      throw new Error("Failed to fetch departure locations");
    }
    return await res.json();
  } catch (error) {
    console.error("API getDepartureLocations error:", error);
    return [];
  }
}

// =====================================
// 6. Lấy toàn bộ tour (dùng cho admin list)
// API gốc: /tours (Spring Data REST, có phân trang)
// Hàm này sẽ tự động đi qua các trang và gom tất cả tour
// =====================================
export async function getAllTours() {
  let allTours = [];
  let url = `${API_BASE}/tours`;

  try {
    while (url) {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch tours");
      }

      const data = await res.json();

      const toursInPage = data._embedded?.tours || [];
      allTours = allTours.concat(toursInPage);

      const nextLink = data._links?.next?.href;
      if (nextLink) {
        // Nếu backend trả relative link thì thêm API_BASE
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
  const token = localStorage.getItem("jwt");
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
    headers: {
      ...(options.headers || {}),
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* GET public */
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

/* POST auth (upsert) */
export async function saveTourUpsert(tour, file, guideIds) {
  const formData = new FormData();

  formData.append(
    "tour",
    new Blob([JSON.stringify(tour)], { type: "application/json" })
  );

  if (file) formData.append("file", file);

  return fetchJsonAuth(`${API_BASE}/admin/tour/save?guideIds=${guideIds}`, {
    method: "POST",
    body: formData,
  });
}

/* DELETE auth */
export async function deleteTour(tourId) {
  const res = await fetch(`${API_BASE}/admin/tour/${tourId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) throw new Error(await res.text());
  return true;
}

export async function getTourParticipants(tourId) {
  const res = await fetch(`${API_BASE}/admin/tour/${tourId}/participants`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export async function getMonthlyTourStats(month, year) {
  const res = await fetch(
    `${API_BASE}/admin/tour/monthly?month=${month}&year=${year}`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        Accept: "application/json",
      },
    }
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

/**
 * ========================================================
 * ✅ FILTER TOURS (GỘP 1 ENDPOINT)
 * API:
 * /tours/search/filterTours{?keyword,startDate,durationDay,departureLocation,status,page,size,sort*}
 * ========================================================
 */
export async function filterTours({
  keyword = "",
  startDate = "",
  durationDay = "", // lưu ý: backend key là durationDay (không phải durationDays)
  departureLocation = "",
  status = "Activated", // ✅ bạn yêu cầu status mặc định Activated
  page = 0,
  size = 8,
  sort = "startDate,asc",
} = {}) {
  const params = new URLSearchParams();

  // backend nhận đúng key: keyword, startDate, durationDay, departureLocation, status
  if (keyword && String(keyword).trim())
    params.set("keyword", String(keyword).trim());
  if (startDate) params.set("startDate", startDate);

  // durationDay có thể là "" hoặc số
  if (durationDay !== "" && durationDay != null) {
    params.set("durationDay", String(durationDay));
  }

  if (departureLocation) params.set("departureLocation", departureLocation);

  // ✅ luôn gửi status (Activated) để backend lọc đúng
  if (status) params.set("status", status);

  // pagination + sort
  params.set("page", String(page));
  params.set("size", String(size));
  if (sort) params.set("sort", sort);

  const url = `${API_BASE}/tours/search/filterTours?${params.toString()}`;

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
        .filter((id) => id !== null && id !== undefined)
    )
  );

  const bookingIds = Array.from(
    new Set(
      successBookings
        .map((p) => p?.bookingId)
        .filter((id) => id !== null && id !== undefined)
    )
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
      headers: { ...getAuthHeaders(), Accept: "application/json" },
    });

    const data = await readJsonOrText(res);

    if (!res.ok) {
      console.error("refund failed:", { bookingId, status: res.status, data });
      throw new Error(
        typeof data === "string"
          ? data
          : data?.message || `Refund failed for bookingId=${bookingId}`
      );
    }

    console.log("refund ok:", bookingId, data);
  }
}
