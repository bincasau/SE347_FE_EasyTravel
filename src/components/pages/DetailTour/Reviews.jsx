import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { popup } from "@/utils/popup";

const API_BASE = "http://localhost:8080";
const S3_BASE = "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

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
      <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || "user"}
      className="w-9 h-9 rounded-full object-cover border"
      onError={() => setImgOk(false)}
      loading="lazy"
    />
  );
}

function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) =>
        n <= v ? (
          <FaStar key={n} className="text-orange-400" />
        ) : (
          <FaRegStar key={n} className="text-gray-300" />
        ),
      )}
    </div>
  );
}

function StarPicker({ value = 5, onChange }) {
  const v = Math.max(1, Math.min(5, Number(value || 5)));
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className="leading-none"
          aria-label={`rate ${n}`}
        >
          {n <= v ? (
            <FaStar className="text-orange-400" />
          ) : (
            <FaRegStar className="text-gray-300" />
          )}
        </button>
      ))}
    </div>
  );
}

function fmtDate(value) {
  if (!value) return "--";
  try {
    // nếu BE trả "2025-03-05" hoặc ISO string đều OK
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "--";
  }
}

export default function Reviews({ tourId }) {
  const [reviews, setReviews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);

  // login state
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwt"));
  useEffect(() => {
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem("jwt"));
    const onJwtChanged = () => setIsLoggedIn(!!localStorage.getItem("jwt"));
    window.addEventListener("storage", onStorage);
    window.addEventListener("jwt-changed", onJwtChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("jwt-changed", onJwtChanged);
    };
  }, []);

  // create
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // edit
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // ===== map DTO đúng theo sample bạn gửi =====
  const getId = (r, i) => r?.reviewId ?? r?.id ?? i;
  const getRating = (r) => Number(r?.rating ?? 0);
  const getComment = (r) => r?.comment ?? "";
  const getCreatedAt = (r) => r?.createdAt ?? r?.created_at ?? "";
  const getName = (r) => r?.userName ?? r?.reviewerName ?? "Anonymous";
  const getAvatar = (r) => {
    // BE trả: "user_27.jpg"
    const fn = r?.userAvatar || r?.avatar || "";
    return fn ? `${S3_BASE}/${fn}` : "";
  };

  const visibleReviews = useMemo(
    () => reviews.slice(0, visibleCount),
    [reviews, visibleCount],
  );

  // ✅ LOAD LIST (ĐỔI ENDPOINT CHO ĐÚNG CONTROLLER)
  const reload = useCallback(async () => {
    if (!tourId) return;

    const res = await fetchWithJwt(`/custom-reviews/${tourId}/tour`);
    if (!res.ok) throw new Error(await readText(res));

    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.content || [];

    // sort newest first (phòng khi BE chưa sort)
    const sorted = [...list].sort((a, b) => {
      const ta = new Date(getCreatedAt(a) || 0).getTime();
      const tb = new Date(getCreatedAt(b) || 0).getTime();
      return tb - ta;
    });

    setReviews(sorted);
  }, [tourId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tourId) return;
      setLoading(true);
      try {
        await reload();
      } catch (e) {
        console.error(e);
        if (mounted) {
          setReviews([]);
          popup.error(e?.message || "Không tải được danh sách review.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tourId, reload]);

  const requireLogin = () => {
    popup.error("Bạn cần đăng nhập để thực hiện thao tác này.");
    // window.dispatchEvent(new Event("open-login"));
  };

  // ✅ CREATE
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return requireLogin();
    if (!newComment.trim()) return popup.error("Vui lòng nhập comment.");

    setSubmitting(true);
    try {
      const res = await fetchWithJwt(
        `/custom-reviews/create?tourId=${tourId}`,
        {
          method: "POST",
          body: JSON.stringify({
            rating: Number(newRating),
            comment: newComment.trim(),
          }),
        },
      );
      if (!res.ok) throw new Error(await readText(res));

      popup.success("Gửi review thành công!");
      setNewRating(5);
      setNewComment("");
      setVisibleCount(4);
      await reload();
    } catch (e2) {
      console.error(e2);
      popup.error(e2?.message || "Gửi review thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ EDIT
  const startEdit = (r, i) => {
    const id = getId(r, i);
    setEditingId(id);
    setEditRating(getRating(r) || 5);
    setEditComment(getComment(r) || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(5);
    setEditComment("");
  };

  const handleUpdate = async () => {
    if (!isLoggedIn) return requireLogin();
    if (!editingId) return;
    if (!editComment.trim()) return popup.error("Vui lòng nhập comment.");

    setSavingEdit(true);
    try {
      const res = await fetchWithJwt(`/custom-reviews/update/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          rating: Number(editRating),
          comment: editComment.trim(),
        }),
      });
      if (!res.ok) throw new Error(await readText(res));

      popup.success("Cập nhật review thành công!");
      cancelEdit();
      await reload();
    } catch (e) {
      console.error(e);
      popup.error(e?.message || "Cập nhật review thất bại!");
    } finally {
      setSavingEdit(false);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!isLoggedIn) return requireLogin();
    const ok = await popup.confirm("Bạn chắc chắn muốn xoá review này?");
    if (!ok) return;

    try {
      const res = await fetchWithJwt(`/custom-reviews/delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await readText(res));

      popup.success("Đã xoá review!");
      await reload();
    } catch (e) {
      console.error(e);
      popup.error(e?.message || "Không thể xoá review!");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-5xl font-semibold text-gray-800 mb-6">
        Reviews ({reviews.length})
      </h2>

      {/* LIST */}
      {loading ? (
        <div className="text-center text-gray-400 italic py-5">
          Đang tải review...
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-5">
          Chưa có review nào. Hãy là người đầu tiên nhé!
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {visibleReviews.map((r, i) => {
              const id = getId(r, i);
              const isEditing = editingId === id;
              const name = getName(r);
              const avatar = getAvatar(r);

              return (
                <div
                  key={id}
                  className="bg-gray-50 p-4 rounded-xl shadow-sm border text-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} src={avatar} />
                      <div>
                        <div className="font-semibold text-gray-800">
                          {name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {fmtDate(getCreatedAt(r))}
                        </div>
                        <div className="mt-1">
                          {!isEditing ? (
                            <Stars value={getRating(r)} />
                          ) : (
                            <StarPicker
                              value={editRating}
                              onChange={setEditRating}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {isLoggedIn && (
                      <div className="flex items-center gap-2">
                        {!isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(r, i)}
                              className="text-xs px-3 py-1 rounded-full border hover:bg-white"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Xoá
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={handleUpdate}
                              disabled={savingEdit}
                              className={`text-xs px-3 py-1 rounded-full text-white ${
                                savingEdit
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-orange-500 hover:bg-orange-600"
                              }`}
                            >
                              {savingEdit ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-xs px-3 py-1 rounded-full border hover:bg-white"
                            >
                              Huỷ
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    <p className="text-gray-600 italic mt-2">
                      "{getComment(r)}"
                    </p>
                  ) : (
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="mt-3 w-full border rounded-xl px-3 py-2 text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {reviews.length > 4 && (
            <div className="text-center mt-5">
              {visibleCount < reviews.length ? (
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
        </>
      )}

      {/* FORM (nằm dưới list giống Blog) */}
      <form
        onSubmit={handleCreate}
        className="mt-8 bg-gray-50 p-5 rounded-xl shadow-sm border"
      >
        <h4 className="font-semibold text-gray-800 mb-3">Viết review</h4>

        {!isLoggedIn && (
          <div className="text-xs text-gray-500 mb-3">
            Bạn cần đăng nhập để review tour
          </div>
        )}

        <StarPicker value={newRating} onChange={setNewRating} />

        <textarea
          disabled={!isLoggedIn}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          className="mt-3 w-full border rounded-md px-3 py-2 text-sm h-24 resize-none focus:ring-2 focus:ring-orange-400 outline-none disabled:bg-gray-100"
        />

        <button
          type="submit"
          disabled={!isLoggedIn || submitting}
          className={`mt-3 px-5 py-2 rounded-full text-white font-medium transition ${
            !isLoggedIn || submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {submitting ? "Đang gửi..." : "Gửi review"}
        </button>
      </form>
    </section>
  );
}
