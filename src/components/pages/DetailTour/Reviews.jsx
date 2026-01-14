import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { popup } from "@/utils/popup";

const API_BASE = "http://localhost:8080";
const S3_AVATAR_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

const userAvatarUrl = (userId) =>
  userId != null ? `${S3_AVATAR_BASE}/user_${userId}.jpg` : "";

async function fetchWithJwt(url, options = {}) {
  const token = localStorage.getItem("jwt");
  const finalUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  return fetch(finalUrl, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

const readText = async (res) => {
  try {
    const t = await res.text();
    return t || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
};

function Avatar({ name, src }) {
  const [imgOk, setImgOk] = useState(true);
  const initial = (name || "A").trim().charAt(0).toUpperCase();

  if (!src || !imgOk) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">
        {initial}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name || "user"}
      className="w-8 h-8 rounded-full object-cover border"
      onError={() => setImgOk(false)}
      loading="lazy"
    />
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          className="leading-none"
          aria-label={`rate ${n}`}
        >
          {n <= value ? (
            <FaStar className="text-orange-400" />
          ) : (
            <FaRegStar className="text-gray-300" />
          )}
        </button>
      ))}
    </div>
  );
}

function StarsView({ rating }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, idx) =>
        idx < (rating || 0) ? (
          <FaStar key={idx} className="text-orange-400" />
        ) : (
          <FaRegStar key={idx} className="text-gray-300" />
        )
      )}
    </div>
  );
}

export default function Reviews({ tourId }) {
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [userMap, setUserMap] = useState({});

  // ✅ login check
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwt"));
  useEffect(() => {
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem("jwt"));
    window.addEventListener("storage", onStorage);

    // (optional) nếu bạn có dispatch event "jwt-changed" như login modal:
    const onJwtChanged = () => setIsLoggedIn(!!localStorage.getItem("jwt"));
    window.addEventListener("jwt-changed", onJwtChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("jwt-changed", onJwtChanged);
    };
  }, []);

  const [actionErr, setActionErr] = useState("");

  // create
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // edit
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const getReviewId = (r) =>
    r?.id ?? r?.reviewId ?? r?.review_id ?? r?.reviewID ?? null;

  const fetchReviews = useCallback(async () => {
    try {
      setActionErr("");
      if (!tourId) return;

      const res = await fetchWithJwt(`/tours/${tourId}/reviews`, {
        method: "GET",
      });
      if (!res.ok) throw new Error(await readText(res));

      const data = await res.json();
      const items = data?._embedded?.reviews || data || [];
      const sorted = [...items].sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );
      setReviews(sorted);
    } catch (err) {
      console.error("❌ fetchReviews error:", err);
      const msg = err?.message || "Fetch reviews lỗi.";
      setActionErr(msg);
      popup.error(msg);
    }
  }, [tourId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // user refs
  const userRefs = useMemo(() => {
    const refs = new Set();
    for (const r of reviews) {
      const href = r?._links?.user?.href;
      if (href) refs.add(href);
      else {
        const uid = r?.user?.userId ?? r?.userId ?? r?.user_id;
        if (uid != null) refs.add(String(uid));
      }
    }
    return [...refs];
  }, [reviews]);

  // fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const need = userRefs.filter((ref) => !userMap[ref]);
        if (!need.length) return;

        const results = await Promise.all(
          need.map(async (ref) => {
            try {
              const url = ref.startsWith("http") ? ref : `/user/${ref}`;
              const res = await fetchWithJwt(url, { method: "GET" });
              if (!res.ok) return [ref, null];
              const u = await res.json();
              return [ref, u];
            } catch {
              return [ref, null];
            }
          })
        );

        setUserMap((prev) => {
          const next = { ...prev };
          results.forEach(([ref, u]) => {
            if (u) next[ref] = u;
          });
          return next;
        });
      } catch (err) {
        console.error("❌ fetchUsers error:", err);
      }
    };

    if (userRefs.length) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRefs]);

  const getCreatedAt = (r) => r?.createdAt ?? r?.created_at ?? null;

  const getUserIdFromReview = (r) =>
    r?.user?.userId ?? r?.userId ?? r?.user_id ?? null;

  const getReviewerName = (r) => {
    if (r?.reviewerName) return r.reviewerName;
    if (r?.user?.name) return r.user.name;

    const href = r?._links?.user?.href;
    if (href && userMap[href]?.name) return userMap[href].name;

    const uid = getUserIdFromReview(r);
    if (uid != null && userMap[String(uid)]?.name)
      return userMap[String(uid)].name;

    return "Anonymous";
  };

  const getReviewerAvatar = (r) => {
    const uid = getUserIdFromReview(r);
    if (r?.user?.avatar) return r.user.avatar;

    const href = r?._links?.user?.href;
    if (href && userMap[href]?.avatar) return userMap[href].avatar;

    if (uid != null) return userAvatarUrl(uid);
    return "";
  };

  const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

  const requireLogin = async () => {
    popup.error("Bạn cần đăng nhập để thực hiện thao tác này.");
    // nếu bạn muốn mở login modal theo hệ thống:
    // window.dispatchEvent(new Event("open-login"));
  };

  // ✅ CREATE
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return requireLogin();
    if (!newComment.trim()) {
      const msg = "Vui lòng nhập comment.";
      setActionErr(msg);
      popup.error(msg);
      return;
    }
    if (!tourId) {
      const msg = "Thiếu tourId.";
      setActionErr(msg);
      popup.error(msg);
      return;
    }

    setSubmitting(true);
    setActionErr("");
    try {
      const payload = { rating: Number(newRating), comment: newComment.trim() };

      const res = await fetchWithJwt(`/custom-reviews/create?tourId=${tourId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await readText(res));

      await fetchReviews();
      setNewComment("");
      setNewRating(5);
      popup.success("Gửi review thành công!");
    } catch (err) {
      console.error("❌ create error:", err);
      const msg = err?.message || "Tạo review lỗi.";
      setActionErr(msg);
      popup.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (r) => {
    const id = getReviewId(r);
    if (!id) {
      const msg = "Không tìm thấy id review.";
      setActionErr(msg);
      popup.error(msg);
      return;
    }
    setEditingId(id);
    setEditRating(Number(r?.rating ?? 5));
    setEditComment(r?.comment ?? "");
    setActionErr("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(5);
    setEditComment("");
  };

  // ✅ UPDATE
  const handleUpdate = async (id) => {
    if (!isLoggedIn) return requireLogin();
    if (!editComment.trim()) {
      const msg = "Vui lòng nhập comment.";
      setActionErr(msg);
      popup.error(msg);
      return;
    }

    setSavingEdit(true);
    setActionErr("");
    try {
      const payload = { rating: Number(editRating), comment: editComment.trim() };

      const res = await fetchWithJwt(`/custom-reviews/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await readText(res));

      await fetchReviews();
      cancelEdit();
      popup.success("Cập nhật review thành công!");
    } catch (err) {
      console.error("❌ update error:", err);
      const msg = err?.message || "Sửa review lỗi.";
      setActionErr(msg);
      popup.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!isLoggedIn) return requireLogin();

    const ok = await popup.confirm("Bạn chắc chắn muốn xoá review này?");
    if (!ok) return;

    setActionErr("");
    try {
      const res = await fetchWithJwt(`/custom-reviews/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await readText(res));

      await fetchReviews();
      popup.success("Đã xoá review!");
    } catch (err) {
      console.error("❌ delete error:", err);
      const msg = err?.message || "Xoá review lỗi.";
      setActionErr(msg);
      popup.error(msg);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <h2 className="text-5xl font-podcast text-gray-800">Reviews</h2>

        {/* giữ lại box error nếu bạn muốn */}
        {actionErr && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {actionErr}
          </div>
        )}
      </div>

      {/* ✅ WRITE: chỉ hiện khi login */}
      {isLoggedIn ? (
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-gray-800 font-semibold">Viết review của bạn</div>

          <form onSubmit={handleCreate} className="mt-4 grid gap-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700 w-20">Rating</div>
              <StarPicker value={newRating} onChange={setNewRating} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-gray-700">Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                disabled={submitting}
              />
            </div>

            <div className="rounded-2xl border border-dashed border-gray-300 p-4 bg-gray-50">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Preview
              </div>
              <StarsView rating={newRating} />
              <p className="text-gray-700 text-sm mt-2 italic">
                {newComment.trim()
                  ? `"${newComment.trim()}"`
                  : `"Chưa có nội dung..."`}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
                  submitting
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {submitting ? "Đang gửi..." : "Gửi review"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-gray-800 font-semibold mb-1">
            Bạn cần đăng nhập để viết review
          </div>
          <div className="text-sm text-gray-500">
            Đăng nhập xong bạn sẽ có thể đánh giá và bình luận tour này.
          </div>
        </div>
      )}

      {/* LIST */}
      {!reviews.length ? (
        <div className="text-gray-500">No reviews yet for this tour.</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleReviews.map((r, i) => {
              const id = getReviewId(r) ?? i;
              const name = getReviewerName(r);
              const avatarSrc = getReviewerAvatar(r);
              const isEditing = editingId === id;

              return (
                <div
                  key={id}
                  className="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    {!isEditing ? (
                      <StarsView rating={r.rating || 0} />
                    ) : (
                      <StarPicker value={editRating} onChange={setEditRating} />
                    )}

                    {/* ✅ chỉ hiện Sửa/Xoá khi login */}
                    {isLoggedIn && (
                      <>
                        {!isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(r)}
                              className="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Xoá
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdate(id)}
                              disabled={savingEdit}
                              className={`text-xs px-3 py-1 rounded-lg ${
                                savingEdit
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-orange-500 text-white hover:bg-orange-600"
                              }`}
                            >
                              {savingEdit ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                              Huỷ
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!isEditing ? (
                    <p className="text-gray-700 text-sm mb-4 italic line-clamp-4">
                      "{r.comment}"
                    </p>
                  ) : (
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 mb-4"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <Avatar name={name} src={avatarSrc} />
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold text-gray-800">{name}</div>
                      {getCreatedAt(r) && (
                        <div className="text-[12px] text-gray-400">
                          {new Date(getCreatedAt(r)).toLocaleDateString("vi-VN")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {reviews.length > 6 && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="text-orange-500 text-sm font-medium hover:underline"
              >
                {showAll ? "Show less" : "Show more..."}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
