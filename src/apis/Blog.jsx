// src/apis/BlogAPI.js

const API_BASE = "http://localhost:8080";

export async function getAllBlogs() {
  try {
    const res = await fetch(`${API_BASE}/blogs`);

    if (!res.ok) {
      throw new Error(`Failed to fetch blogs: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // Dữ liệu HAL: nằm trong _embedded.blogs
    return data._embedded?.blogs ?? [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

const API_URL = "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getBlogById(id) {
  const res = await fetch(`${API_URL}/blogs/${id}`, { method: "GET" });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Get blog failed");
  }

  // parse JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Response không phải JSON");
  }
}

export async function saveBlog(payload, file) {
  const url = `${API_BASE}/admin/blog/save`;
  const headers = { ...getAuthHeaders() };

  const fd = new FormData();

  // LUÔN LUÔN dùng FormData và Blob cho phần blog data
  // Điều này đảm bảo Content-Type của part "blog" luôn là application/json
  fd.append(
    "blog",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );

  // Nếu có file thì append, không có thì Backend nhận được null (required = false)
  if (file) {
    fd.append("file", file);
  }

  // QUAN TRỌNG: Không set "Content-Type" thủ công khi dùng fetch + FormData.
  // Trình duyệt sẽ tự động thêm boundary cho multipart/form-data.
  const res = await fetch(url, {
    method: "POST",
    headers: headers, // Chỉ chứa Authorization Bearer token
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Save blog failed: ${res.status} ${res.statusText} ${text}`,
    );
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function deleteBlog(id) {
  const res = await fetch(`${API_URL}/admin/delete-blog/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Delete blog failed");
  console.log("DELETE /admin/delete-blog/:id response =", text);
  return text; // BE trả string
}
