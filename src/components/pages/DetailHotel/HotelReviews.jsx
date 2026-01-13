import React, { useEffect, useState, useCallback } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

const API_BASE = "http://localhost:8080";

async function fetchWithJwt(url, options = {}) {
  const token = localStorage.getItem("jwt");
  return fetch(`${API_BASE}${url}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
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

function Stars({ value }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) =>
        n <= value ? (
          <FaStar key={n} className="text-orange-400" />
        ) : (
          <FaRegStar key={n} className="text-gray-300" />
        )
      )}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
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

export default function HotelReviews({ hotelId }) {
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [error, setError] = useState("");

  const isLoggedIn = !!localStorage.getItem("jwt");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetchWithJwt(
        `/custom-reviews/list?hotelId=${hotelId}&page=0&size=100&sort=createdAt,desc`
      );
      if (!res.ok) throw new Error(await readText(res));
      const data = await res.json();
      setReviews(data.content || []);
    } catch (e) {
      setError(e.message);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // CREATE
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return setError("Bạn cần đăng nhập để review.");
    if (!newComment.trim()) return setError("Vui lòng nhập comment.");

    try {
      const res = await fetchWithJwt(
        `/custom-reviews/create?hotelId=${hotelId}`,
        {
          method: "POST",
          body: JSON.stringify({
            rating: newRating,
            comment: newComment.trim(),
          }),
        }
      );
      if (!res.ok) throw new Error(await readText(res));
      setNewComment("");
      setNewRating(5);
      fetchReviews();
    } catch (e) {
      setError(e.message);
    }
  };

  // UPDATE
  const handleUpdate = async (id) => {
    try {
      const res = await fetchWithJwt(`/custom-reviews/update/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          rating: editRating,
          comment: editComment.trim(),
        }),
      });
      if (!res.ok) throw new Error(await readText(res));
      setEditingId(null);
      fetchReviews();
    } catch (e) {
      setError(e.message);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá review này?")) return;
    try {
      const res = await fetchWithJwt(`/custom-reviews/delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await readText(res));
      fetchReviews();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="mt-14">
      <h2 className="text-3xl font-podcast mb-6">Hotel Reviews</h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
          {error}
        </div>
      )}

      {/* WRITE */}
      <form
        onSubmit={handleCreate}
        className="mb-8 bg-white border rounded-2xl p-5"
      >
        <div className="font-semibold mb-3">Viết review</div>

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
          className="mt-3 w-full border rounded-xl p-3 text-sm"
        />

        <div className="flex justify-end mt-3">
          <button
            disabled={!isLoggedIn}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm disabled:bg-gray-300"
          >
            Gửi
          </button>
        </div>
      </form>

      {/* LIST */}
      {!reviews.length ? (
        <div className="text-gray-500">Chưa có review nào.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.reviewId}
              className="bg-white border rounded-2xl p-5"
            >
              {editingId === r.reviewId ? (
                <>
                  <StarPicker
                    value={editRating}
                    onChange={setEditRating}
                  />
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={3}
                    className="mt-3 w-full border rounded-xl p-3 text-sm"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleUpdate(r.reviewId)}
                      className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="border px-3 py-1 rounded-lg text-xs"
                    >
                      Huỷ
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Stars value={r.rating} />
                  <p className="italic text-sm my-3">"{r.comment}"</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      {r.reviewerName || "Anonymous"}
                    </span>
                    {isLoggedIn && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(r.reviewId);
                            setEditRating(r.rating);
                            setEditComment(r.comment);
                          }}
                          className="text-blue-600"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(r.reviewId)}
                          className="text-red-600"
                        >
                          Xoá
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
