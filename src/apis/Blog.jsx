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
