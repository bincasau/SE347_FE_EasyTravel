import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";
const USER_ENDPOINT = (id) => `/user/${id}`; // 🔁 nếu BE là /users/{id} thì đổi thành `/users/${id}`

async function fetchWithJwt(url, options = {}) {
  const token = localStorage.getItem("jwt");
  const finalUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  return fetch(finalUrl, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function AvatarLetter({ name }) {
  const initial = (name || "A").trim().charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">
      {initial}
    </div>
  );
}

export default function BlogComments({ blogId }) {
  const [comments, setComments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState({ name: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  // cache user theo userId
  const [userMap, setUserMap] = useState({}); // { [userId]: userObj }

  // 1) Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await fetchWithJwt(`/blogs/${blogId}/comments`);
        if (!res.ok) throw new Error("Không thể tải bình luận");

        const data = await res.json();
        const list = data?._embedded?.comments || data || [];
        setComments(list);
      } catch (err) {
        console.error("❌ Lỗi fetch bình luận:", err);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) fetchComments();
  }, [blogId]);

  // 2) Extract user ids from comments
  const userIds = useMemo(() => {
    const s = new Set();
    for (const c of comments) {
      // ✅ các key hay gặp
      const uid =
        c?.user_id ??
        c?.userId ??
        c?.user?.userId ??
        c?.user?.id ??
        null;

      if (uid != null) s.add(String(uid));
    }
    return [...s];
  }, [comments]);

  // 3) Fetch users by ids
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const need = userIds.filter((id) => !userMap[id]);
        if (!need.length) return;

        const results = await Promise.all(
          need.map(async (id) => {
            const res = await fetchWithJwt(USER_ENDPOINT(id));
            if (!res.ok) return [id, null];
            const u = await res.json();
            return [id, u];
          })
        );

        setUserMap((prev) => {
          const next = { ...prev };
          results.forEach(([id, u]) => {
            if (u) next[id] = u;
          });
          return next;
        });
      } catch (err) {
        console.error("❌ Lỗi fetch users:", err);
      }
    };

    if (userIds.length) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIds]);

  // Helpers
  const visibleComments = comments.slice(0, visibleCount);

  const getUserIdFromComment = (c) =>
    c?.user_id ?? c?.userId ?? c?.user?.userId ?? c?.user?.id ?? null;

  const getUserNameFromUserObj = (u) =>
    u?.name || u?.fullName || u?.username || u?.email || null;

  const getCommenterName = (c) => {
    // nếu comment có lưu name text sẵn
    if (c?.name && String(c.name).trim()) return c.name;

    // lấy từ user fetch về theo user_id
    const uid = getUserIdFromComment(c);
    if (uid != null) {
      const u = userMap[String(uid)];
      const n = getUserNameFromUserObj(u);
      if (n) return n;
    }

    return "Anonymous";
  };

  // 4) Submit comment mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.name.trim() || !newComment.content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetchWithJwt(`/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      if (!res.ok) throw new Error("Không thể gửi bình luận");

      const created = await res.json();
      setComments((prev) => [created, ...prev]);
      setNewComment({ name: "", content: "" });
      setVisibleCount(4);
    } catch (err) {
      console.error("❌ Lỗi khi gửi bình luận:", err);
      alert("Không thể gửi bình luận, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center text-gray-400 italic py-5">
        Đang tải bình luận...
      </div>
    );

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-5">
        Bình luận ({comments.length})
      </h3>

      {/* --- Danh sách bình luận --- */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-5">
          Chưa có bình luận nào. Hãy là người đầu tiên nhé!
        </p>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((c, i) => {
            const name = getCommenterName(c);

            return (
              <div
                key={c.comment_id ?? c.commentId ?? c.id ?? i}
                className="bg-gray-50 p-4 rounded-xl shadow-sm border text-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <AvatarLetter name={name} />
                    <div>
                      <div className="font-semibold text-gray-800">{name}</div>
                      <div className="text-xs text-gray-400">
                        {c.createdAt || c.created_at
                          ? new Date(c.createdAt || c.created_at).toLocaleDateString(
                              "vi-VN"
                            )
                          : "--"}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600">
                  {c.content || "(Không có nội dung)"}
                </p>
              </div>
            );
          })}

          {/* Show more / Show less */}
          {comments.length > 4 && (
            <div className="text-center mt-5">
              {visibleCount < comments.length ? (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
                >
                  Show more
                </button>
              ) : (
                <button
                  onClick={() => setVisibleCount(4)}
                  className="px-5 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition"
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- Form viết bình luận --- */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 bg-gray-50 p-5 rounded-xl shadow-sm border"
      >
        <h4 className="font-semibold text-gray-800 mb-3">Viết bình luận</h4>

        <input
          type="text"
          placeholder="Tên của bạn"
          value={newComment.name}
          onChange={(e) =>
            setNewComment({ ...newComment, name: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-orange-400 outline-none"
        />

        <textarea
          placeholder="Nội dung bình luận..."
          value={newComment.content}
          onChange={(e) =>
            setNewComment({ ...newComment, content: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm h-24 resize-none focus:ring-2 focus:ring-orange-400 outline-none"
        />

        <button
          type="submit"
          disabled={submitting}
          className={`mt-3 px-5 py-2 rounded-full text-white font-medium transition ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {submitting ? "Đang gửi..." : "Gửi bình luận"}
        </button>
      </form>
    </div>
  );
}
