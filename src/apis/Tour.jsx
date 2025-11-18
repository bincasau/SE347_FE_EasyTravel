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
