import { getToken } from "@/utils/auth";

const API_BASE = "http://localhost:8080";

async function fetchWithJwt(url, options = {}) {
  const token = getToken();
  const finalUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const res = await fetch(finalUrl, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res;
}

// ✅ GET comments theo blogId  (bạn thêm BE endpoint này)
export async function getCommentsByBlogId(blogId) {
  const res = await fetchWithJwt(`/blogs/${blogId}/comments`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ ADD comment: POST /auth/comments/add?content=&blogId=
export async function addComment(blogId, content) {
  const params = new URLSearchParams();
  params.set("content", content);
  params.set("blogId", String(blogId));

  const res = await fetchWithJwt(`/auth/comments/add?${params.toString()}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json(); // BE trả Comment (sau khi fix JsonIgnoreProperties)
}

// ✅ UPDATE comment: PUT /auth/comments/{id} body text/plain
export async function updateComment(commentId, newContent) {
  const res = await fetchWithJwt(`/auth/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: newContent,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ DELETE comment
export async function deleteComment(commentId) {
  const res = await fetchWithJwt(`/auth/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error(await res.text());
  return true;
}
