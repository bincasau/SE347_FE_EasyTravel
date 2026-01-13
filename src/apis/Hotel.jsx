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

export async function getHotelById(hotelId) {
  const url = `${API_BASE}/hotels/${hotelId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không thể tải thông tin khách sạn");
  return res.json();
}

// Lấy phòng theo ID
export async function getRoomById(roomId) {
  const url = `${API_BASE}/rooms/${roomId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không thể tải thông tin phòng");
  return res.json();
}

export async function getAllHotels(sort = "hotelId,asc") {
  const params = new URLSearchParams();
  params.append("page", 0);
  params.append("size", 9999);
  params.append("sort", sort);

  const url = `${API_BASE}/hotels?${params.toString()}`;

  const res = await fetch(url);
  const data = await res.json();

  return data._embedded?.hotels ?? [];
}


// Lấy danh sách ảnh của khách sạn
export const fetchHotelImages = async (hotelId) => {
  const res = await fetch(`${API_BASE}/hotels/${hotelId}/images`);
  if (!res.ok) {
    throw new Error("Không lấy được danh sách ảnh khách sạn");
  }
  const data = await res.json();
  return data?._embedded?.images || [];
};

export async function addHotel({ hotelData, imageFile, managerUsername }) {
  const token = localStorage.getItem("jwt");
  if (!token) throw new Error("Missing JWT (localStorage key: jwt)");

  const formData = new FormData();
  formData.append(
    "hotel",
    new Blob([JSON.stringify(hotelData)], { type: "application/json" })
  );
  if (imageFile) formData.append("file", imageFile);

  formData.append("managerUsername", managerUsername);

  const res = await fetch(`${API_BASE}/admin/add-hotel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const text = await res.text(); 
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

  // nếu backend trả JSON
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const API_URL = "http://localhost:8080";

export async function updateHotel(hotelId, hotelData, file) {
  const formData = new FormData();
  formData.append(
    "hotel",
    new Blob([JSON.stringify(hotelData)], { type: "application/json" })
  );
  if (file) formData.append("file", file);

  const token = localStorage.getItem("jwt");

  const res = await fetch(`${API_URL}/admin/update-hotel/${hotelId}`, {
    method: "PUT",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Update hotel failed");
  }

  return res.json();
}

export async function deleteHotel(id) {
  const token = localStorage.getItem("jwt");

  const res = await fetch(`${API_URL}/admin/delete-hotel/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Delete hotel failed");

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Lấy manager (user) của khách sạn theo hotelId (admin)
export async function getHotelManagerByHotelId(hotelId) {
  if (!hotelId) throw new Error("hotelId is required");

  const token = localStorage.getItem("jwt");

  const res = await fetch(
    `${API_BASE}/admin/hotel/${hotelId}/manager`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to get hotel manager");
  }

  return res.json();
}