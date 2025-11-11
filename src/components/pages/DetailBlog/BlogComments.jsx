import React, { useEffect, useState } from "react";

const BlogComments = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch comments của blog
  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:8080/blogs/${blogId}/comments`);
      if (!res.ok) throw new Error("Không thể tải bình luận");
      const data = await res.json();

      const list = data._embedded
        ? data._embedded.comments
        : Array.isArray(data)
        ? data
        : [];

      const formatted = list.map((c) => ({
        id: c.comment_id || c.id,
        content: c.content,
        createdAt: new Date(c.created_at).toLocaleDateString("vi-VN"),
        user: c.user?.name || "Ẩn danh",
        avatar: `https://i.pravatar.cc/80?u=${c.user_id || c.comment_id}`,
      }));

      setComments(formatted);
    } catch (err) {
      console.error("❌ Lỗi fetch comments:", err);
    }
  };

  useEffect(() => {
    if (blogId) fetchComments();
  }, [blogId]);

  // ✅ Gửi comment mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          created_at: new Date().toISOString(),
          blog_id: blogId,
          user_id: 1, // ✅ sau này thay bằng user thực
        }),
      });
      if (!res.ok) throw new Error("Không thể gửi bình luận");
      setContent("");
      fetchComments(); // reload lại list
    } catch (err) {
      console.error("❌ Lỗi khi gửi comment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      {/* --- Danh sách bình luận --- */}
      <h3 className="font-semibold text-gray-800 mb-4">
        {comments.length} Comment{comments.length !== 1 && "s"}
      </h3>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={c.avatar}
                  alt="comment"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-800">{c.user}</p>
                  <p className="text-xs text-gray-500">{c.createdAt}</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-6">
          Chưa có bình luận nào, hãy là người đầu tiên nhé!
        </p>
      )}

      {/* --- Form gửi bình luận --- */}
      <div className="mt-10 bg-gray-50 p-6 rounded-xl border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Để lại bình luận</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows="4"
            placeholder="Viết bình luận của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogComments;
