import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { popup } from "@/utils/popup";

const API_BASE = "http://localhost:8080";

// ✅ avatar theo mẫu bạn đang dùng (user_27.jpg)
const S3_USER_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/user";

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
    return await res.text();
  } catch {
    return `${res.status} ${res.statusText}`;
  }
};

function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) =>
        n <= v ? (
          <FaStar key={n} className="text-orange-400" />
        ) : (
          <FaRegStar key={n} className="text-gray-300" />
        )
      )}
    </div>
  );
}

function StarPicker({ value = 5, onChange }) {
  const v = Math.max(1, Math.min(5, Number(value || 5)));
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange?.(n)}>
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
    // createdAt của bạn là "2025-03-05" => vẫn parse ok
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "--";
  }
}

function Avatar({ name, avatar }) {
  const initial = (name || "A").trim().charAt(0).toUpperCase();
  const [imgOk, setImgOk] = useState(true);

  const src = avatar ? `${S3_USER_BASE}/${avatar}` : "";

  return (
    <div className="w-9 h-9 rounded-full overflow-hidden border bg-gray-200 grid place-items-center flex-shrink-0">
      {avatar && imgOk ? (
        <img
          src={src}
          alt={name || "avatar"}
          className="w-full h-full object-cover"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="text-xs font-semibold text-gray-700">{initial}</span>
      )}
    </div>
  );
}

export default function HotelReviews({ hotelId }) {
  const [reviews, setReviews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = !!localStorage.getItem("jwt");

  // ✅ mapping đúng JSON bạn gửi
  const getId = (r, i) => r?.reviewId ?? i;
  const getName = (r) => r?.userName || "Anonymous";
  const getAvatar = (r) => r?.userAvatar || "";
  const getRating = (r) => Number(r?.rating ?? 0);
  const getComment = (r) => r?.comment ?? "";
  const getTime = (r) => r?.createdAt ?? "";

  const visibleReviews = useMemo(
    () => reviews.slice(0, visibleCount),
    [reviews, visibleCount]
  );

  // ✅ reload list
  const reload = useCallback(async () => {
    if (!hotelId) return;

    // controller của bạn: GET /custom-reviews/{hotelId}/hotel
    const res = await fetchWithJwt(`/custom-reviews/${hotelId}/hotel`);
    if (!res.ok) throw new Error(await readText(res));

    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.content || [];

    const sorted = [...list].sort((a, b) => {
      const ta = new Date(getTime(a) || 0).getTime();
      const tb = new Date(getTime(b) || 0).getTime();
      return tb - ta;
    });

    setReviews(sorted);
  }, [hotelId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!hotelId) return;
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
  }, [hotelId, reload]);

  // ✅ CREATE
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) return popup.error("Bạn cần đăng nhập để review.");
    if (!newComment.trim()) return popup.error("Vui lòng nhập comment.");

    setSubmitting(true);
    try {
      const res = await fetchWithJwt(`/custom-reviews/create?hotelId=${hotelId}`, {
        method: "POST",
        body: JSON.stringify({
          rating: newRating,
          comment: newComment.trim(),
        }),
      });
      if (!res.ok) throw new Error(await readText(res));

      setNewComment("");
      setNewRating(5);
      setVisibleCount(4);

      popup.success("Gửi review thành công!");
      await reload();
    } catch (e2) {
      console.error(e2);
      popup.error(e2?.message || "Gửi review thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ UPDATE
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
    if (!editingId) return;
    if (!editComment.trim()) return popup.error("Vui lòng nhập comment.");

    setSavingEdit(true);
    try {
      const res = await fetchWithJwt(`/custom-reviews/update/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          rating: editRating,
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
    const ok = await popup.confirm("Xoá review này?");
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
    <section className="mt-14">
      <h2 className="text-3xl font-podcast mb-6">
        Hotel Reviews ({reviews.length})
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
              const name = getName(r);

              return (
                <div
                  key={id}
                  className="bg-gray-50 p-4 rounded-xl shadow-sm border text-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} avatar={getAvatar(r)} />

                      <div>
                        <div className="font-semibold text-gray-800">{name}</div>
                        <div className="text-xs text-gray-400">
                          {fmtDate(getTime(r))}
                        </div>
                        <div className="mt-1">
                          <Stars value={getRating(r)} />
                        </div>
                      </div>
                    </div>

                    {isLoggedIn && (
                      <div className="flex items-center gap-2">
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
                      </div>
                    )}
                  </div>

                  {editingId === id ? (
                    <div className="mt-2">
                      <StarPicker value={editRating} onChange={setEditRating} />

                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="mt-3 w-full border rounded-xl px-3 py-2 text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-orange-400"
                      />

                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={handleUpdate}
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
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 rounded-full border text-sm hover:bg-white"
                        >
                          Huỷ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 italic mt-2">
                      "{getComment(r)}"
                    </p>
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

      {/* FORM (đưa xuống dưới list) */}
      <form
        onSubmit={handleCreate}
        className="mt-8 bg-gray-50 p-5 rounded-xl shadow-sm border"
      >
        <h4 className="font-semibold text-gray-800 mb-3">Viết review</h4>

        {!isLoggedIn && (
          <div className="text-xs text-gray-500 mb-3">
            Bạn cần đăng nhập để review khách sạn
          </div>
        )}

        <StarPicker value={newRating} onChange={setNewRating} />

        <textarea
          disabled={!isLoggedIn}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          placeholder="Nhận xét về khách sạn..."
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
