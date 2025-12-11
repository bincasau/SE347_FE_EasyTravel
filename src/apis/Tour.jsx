// =====================================
// 📌 FILE: src/apis/TourAPI.js
// 📌 Chứa toàn bộ API sử dụng cho Tour
// =====================================

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
export async function searchByStartDate(date) {
  const url = `${API_BASE}/tours/search/findByStartDateGreaterThanEqual?startDate=${date}`;

  const res = await fetch(url);
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
