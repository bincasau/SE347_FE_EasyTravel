import React, { useEffect, useMemo, useState } from "react";
import {
  addComment,
  deleteComment,
  getCommentsByBlogId,
  updateComment,
} from "@/apis/CommentAPI";

function AvatarLetter({ name }) {
  const initial = (name || "A").trim().charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">
      {initial}
    </div>
  );
}

function fmtDate(value) {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return "--";
  }
}

export default function BlogComments({ blogId }) {
  const [comments, setComments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const visibleComments = useMemo(
    () => comments.slice(0, visibleCount),
    [comments, visibleCount]
  );

  const getId = (c, i) => c?.commentId ?? c?.comment_id ?? c?.id ?? i;
  const getName = (c) =>
    c?.user?.name || c?.user?.username || c?.name || "Anonymous";
  const getTime = (c) => c?.createdAt || c?.created_at;
  const getContent = (c) => c?.content || "";

  // ✅ LOAD COMMENTS
  useEffect(() => {
    const load = async () => {
      if (!blogId) return;
      setLoading(true);
      try {
        const list = await getCommentsByBlogId(blogId);
        // list là array comment
        setComments(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Load comments failed:", e);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [blogId]);

  // ✅ ADD
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const created = await addComment(blogId, content.trim());
      setComments((prev) => [created, ...prev]);
      setVisibleCount(4);
      setContent("");
    } catch (e) {
      console.error(e);
      alert(e.message || "Không thể gửi bình luận (cần đăng nhập?)");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ EDIT
  const startEdit = (c) => {
    const id = getId(c);
    setEditingId(id);
    setEditingContent(getContent(c));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editingContent.trim()) return;

    setSavingEdit(true);
    try {
      const updated = await updateComment(editingId, editingContent.trim());
      setComments((prev) =>
        prev.map((c) => (getId(c) === editingId ? updated : c))
      );
      cancelEdit();
    } catch (e) {
      console.error(e);
      alert(e.message || "Không thể sửa bình luận");
    } finally {
      setSavingEdit(false);
    }
  };

  // ✅ DELETE
  const onDelete = async (id) => {
    if (!confirm("Xoá bình luận này?")) return;
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => getId(c) !== id));
    } catch (e) {
      console.error(e);
      alert(e.message || "Không thể xoá bình luận");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 italic py-5">
        Đang tải bình luận...
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-5">
        Bình luận ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-5">
          Chưa có bình luận nào. Hãy là người đầu tiên nhé!
        </p>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((c, i) => {
            const id = getId(c, i);
            const name = getName(c);

            return (
              <div
                key={id}
                className="bg-gray-50 p-4 rounded-xl shadow-sm border text-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <AvatarLetter name={name} />
                    <div>
                      <div className="font-semibold text-gray-800">{name}</div>
                      <div className="text-xs text-gray-400">
                        {fmtDate(getTime(c))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-xs px-3 py-1 rounded-full border hover:bg-white"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(id)}
                      className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Xoá
                    </button>
                  </div>
                </div>

                {editingId === id ? (
                  <div className="mt-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={saveEdit}
                        disabled={savingEdit}
                        className={`px-4 py-2 rounded-full text-white text-sm ${
                          savingEdit
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600"
                        }`}
                      >
                        {savingEdit ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 rounded-full border text-sm hover:bg-white"
                      >
                        Huỷ
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">{getContent(c) || "(Trống)"}</p>
                )}
              </div>
            );
          })}

          {comments.length > 4 && (
            <div className="text-center mt-5">
              {visibleCount < comments.length ? (
                <button
                  onClick={() => setVisibleCount((p) => p + 4)}
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

      {/* form */}
      <form
        onSubmit={onSubmit}
        className="mt-8 bg-gray-50 p-5 rounded-xl shadow-sm border"
      >
        <h4 className="font-semibold text-gray-800 mb-3">Viết bình luận</h4>

        <textarea
          placeholder="Nội dung bình luận..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
