const API_BASE = "http://localhost:8080";

// Lấy danh sách khách sạn (phân trang + sort + search + province)
export async function getHotels({
  page = 0,
  size = 8,
  sort = "hotelId,asc",
  search = "",
  province = "",
}) {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", size);
  params.append("sort", sort);
  if (search.trim() !== "") params.append("search", search);
  if (province.trim() !== "") params.append("province", province);

  const url = `${API_BASE}/hotels?${params.toString()}`;
  const res = await fetch(url);
  return res.json();
}

// Tìm theo tên hoặc địa chỉ
export async function searchHotelsByNameOrAddress(
  keyword,
  page = 0,
  size = 8,
  sort = "hotelId,asc"
) {
  const params = new URLSearchParams();
  params.append("nameKeyword", keyword);
  params.append("addressKeyword", keyword);
  params.append("page", page);
  params.append("size", size);
  params.append("sort", sort);

  const url = `${API_BASE}/hotels/search/findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase?${params.toString()}`;
  const res = await fetch(url);
  return res.json();
}

// Lọc theo tỉnh
export async function searchHotelsByProvince(
  province,
  page = 0,
  size = 8,
  sort = "asc"
) {
  const params = new URLSearchParams();
  params.append("province", province);
  params.append("page", page);
  params.append("size", size);
  params.append("sort", sort);

  const url = `${API_BASE}/hotels/search/findByProvince?${params.toString()}`;
  const res = await fetch(url);
  return res.json();
}

// Lấy danh sách tỉnh
export async function getHotelProvinces() {
  const url = `${API_BASE}/hotels/provinces`;
  const res = await fetch(url);
  return res.json();
}
