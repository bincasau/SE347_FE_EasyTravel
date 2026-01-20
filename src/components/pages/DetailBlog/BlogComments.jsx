import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  addComment,
  deleteComment,
  getCommentsByBlogId,
  updateComment,
} from "@/apis/CommentAPI";
import { popup } from "@/utils/popup";

const S3_USER_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/user";

function fmtDate(value) {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return "--";
  }
}

function Avatar({ name, avatar }) {
  const initial = (name || "A").trim().charAt(0).toUpperCase();
  const src = avatar ? `${S3_USER_BASE}/${avatar}` : "";

  if (!avatar) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || "avatar"}
      className="w-8 h-8 rounded-full object-cover border"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

/**
 * Props:
 * - blogId: required
 * - isLoggedIn?: boolean (optional) -> nếu có, component dùng theo prop này
 * - onOpenLogin?: () => void (optional) -> bấm để mở modal login
 */
export default function BlogComments({ blogId, isLoggedIn, onOpenLogin }) {
  const [comments, setComments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // ===== detect login (fallback) =====
  // Nếu bạn có auth store thì hãy truyền isLoggedIn từ ngoài vào cho chuẩn.
  const fallbackLoggedIn = useMemo(() => {
    try {
      const t =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt");
      return !!t;
    } catch {
      return false;
    }
  }, []);

  const loggedIn = typeof isLoggedIn === "boolean" ? isLoggedIn : fallbackLoggedIn;

  const visibleComments = useMemo(
    () => comments.slice(0, visibleCount),
    [comments, visibleCount]
  );

  // ===== field getters =====
  const getId = (c, i) => c?.commentId ?? c?.id ?? i;
  const getTime = (c) => c?.createdAt ?? c?.time ?? c?.created_at;
  const getContent = (c) => c?.content ?? "";
  const getName = (c) => c?.userName ?? c?.name ?? "Anonymous";
  const getAvatar = (c) => c?.userAvatar ?? c?.avatar ?? "";

  // ===== reload list =====
  const reload = useCallback(async () => {
    if (!blogId) return;

    const data = await getCommentsByBlogId(blogId);

    const list = Array.isArray(data)
      ? data
      : data?._embedded?.comments
      ? data._embedded.comments
      : [];

    const sorted = [...list].sort((a, b) => {
      const ta = new Date(getTime(a) || 0).getTime();
      const tb = new Date(getTime(b) || 0).getTime();
      return tb - ta;
    });

    setComments(sorted);
  }, [blogId]);

  // ===== initial load =====
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!blogId) return;
      setLoading(true);
      try {
        await reload();
      } catch (e) {
        console.error("Load comments failed:", e);
        if (mounted) setComments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [blogId, reload]);

  // ===== ADD =====
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!loggedIn) {
      popup.error("Bạn cần đăng nhập để bình luận.");
      onOpenLogin?.();
      return;
    }

    const text = content.trim();
    if (!text) return;

    setSubmitting(true);
    try {
      await addComment(blogId, text);
      await reload();
      setVisibleCount(4);
      setContent("");
      popup.success("Đã gửi bình luận!");
    } catch (e2) {
      console.error(e2);

      // Nếu backend trả 401/403 thì hiển thị message đăng nhập
      const status = e2?.status || e2?.response?.status;
      if (status === 401 || status === 403) {
        popup.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        onOpenLogin?.();
      } else {
        popup.error(e2?.message || "Không thể gửi bình luận (cần đăng nhập?)");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ===== EDIT =====
  const startEdit = (c) => {
    if (!loggedIn) {
      popup.error("Bạn cần đăng nhập để sửa bình luận.");
      onOpenLogin?.();
      return;
    }
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

    if (!loggedIn) {
      popup.error("Bạn cần đăng nhập để sửa bình luận.");
      onOpenLogin?.();
      return;
    }

    const text = editingContent.trim();
    if (!text) return;

    setSavingEdit(true);
    try {
      await updateComment(editingId, text);
      await reload();
      cancelEdit();
      popup.success("Đã cập nhật bình luận!");
    } catch (e) {
      console.error(e);
      const status = e?.status || e?.response?.status;
      if (status === 401 || status === 403) {
        popup.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        onOpenLogin?.();
      } else {
        popup.error(e?.message || "Không thể sửa bình luận");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // ===== DELETE =====
  const onDelete = async (id) => {
    if (!loggedIn) {
      popup.error("Bạn cần đăng nhập để xoá bình luận.");
      onOpenLogin?.();
      return;
    }

    const ok = await popup.confirm("Xoá bình luận này?");
    if (!ok) return;

    try {
      await deleteComment(id);
      await reload();
      popup.success("Đã xoá bình luận!");
    } catch (e) {
      console.error(e);
      const status = e?.status || e?.response?.status;
      if (status === 401 || status === 403) {
        popup.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        onOpenLogin?.();
      } else {
        popup.error(e?.message || "Không thể xoá bình luận");
      }
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
            const avatar = getAvatar(c);

            return (
              <div
                key={id}
                className="bg-gray-50 p-4 rounded-xl shadow-sm border text-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                      {avatar ? (
                        <Avatar name={name} avatar={avatar} />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">
                          {(name || "A").trim().charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

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
                      className="text-xs px-3 py-1 rounded-full border hover:bg-white disabled:opacity-60"
                      disabled={!loggedIn}
                      title={!loggedIn ? "Đăng nhập để sửa" : "Sửa"}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(id)}
                      className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      disabled={!loggedIn}
                      title={!loggedIn ? "Đăng nhập để xoá" : "Xoá"}
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

      {/* FORM */}
      <form
        onSubmit={onSubmit}
        className="mt-8 bg-gray-50 p-5 rounded-xl shadow-sm border"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <h4 className="font-semibold text-gray-800">Viết bình luận</h4>

          
        </div>

        {!loggedIn && (
          <div className="mb-3 text-sm text-gray-600 bg-white border rounded-lg px-3 py-2">
            Bạn cần <span className="font-semibold">đăng nhập</span> để bình
            luận.
          </div>
        )}

        <textarea
          placeholder={
            loggedIn ? "Nội dung bình luận..." : "Đăng nhập để viết bình luận..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!loggedIn || submitting}
          className={`
            w-full border rounded-md px-3 py-2 text-sm h-24 resize-none
            focus:ring-2 focus:ring-orange-400 outline-none
            ${!loggedIn ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          `}
        />

        <button
          type="submit"
          disabled={!loggedIn || submitting}
          className={`
            mt-3 px-5 py-2 rounded-full text-white font-medium transition
            ${
              !loggedIn || submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }
          `}
        >
          {submitting ? "Đang gửi..." : "Gửi bình luận"}
        </button>
      </form>
    </div>
  );
}
