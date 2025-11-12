import React, { useEffect, useState } from "react";

export default function BlogComments({ blogId }) {
  const [comments, setComments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4); // ✅ hiện 4 cái đầu
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState({ name: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:8080/blogs/${blogId}/comments`);
        if (!res.ok) throw new Error("Không thể tải bình luận");
        const data = await res.json();
        const list = data._embedded?.comments || [];
        setComments(list);
      } catch (err) {
        console.error("❌ Lỗi fetch bình luận:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [blogId]);

  // 🔹 Gửi comment mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.name.trim() || !newComment.content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      if (!res.ok) throw new Error("Không thể gửi bình luận");

      const created = await res.json();
      setComments((prev) => [created, ...prev]);
      setNewComment({ name: "", content: "" });
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

  const visibleComments = comments.slice(0, visibleCount);

  return (
    <div>
      {/* --- Tiêu đề --- */}
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
          {visibleComments.map((c, i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-xl shadow-sm border text-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-800">{c.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <p className="text-gray-600 line-clamp-2">
                {c.content || "(Không có nội dung)"}
              </p>
            </div>
          ))}

          {/* ✅ Nút Show more / Show less */}
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
        ></textarea>

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
