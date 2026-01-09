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

  let res;

  if (file) {
    const fd = new FormData();
    fd.append(
      "blog",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    fd.append("file", file);

    res = await fetch(url, {
      method: "POST",
      headers,
      body: fd,
    });
  } else {
    res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Save blog failed: ${res.status} ${res.statusText} ${text}`
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
