import React, { useEffect, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function Reviews({ tourId }) {
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false); // 👈 trạng thái mở rộng

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${tourId}/reviews`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();

        const items = data._embedded?.reviews || data || [];

        // ✅ Sắp xếp theo rating cao -> thấp
        const sorted = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setReviews(sorted);
      } catch (err) {
        console.error("❌ Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [tourId]);

  if (!reviews.length)
    return (
      <section className="max-w-6xl mx-auto px-6 py-10 text-gray-500">
        <h2 className="text-5xl font-podcast text-gray-800 mb-6">Reviews</h2>
        <p>No reviews yet for this tour.</p>
      </section>
    );

  // ✅ Giới hạn 6 reviews đầu tiên nếu chưa mở rộng
  const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-5xl font-podcast text-gray-800 mb-10">Reviews</h2>

      {/* Danh sách reviews */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleReviews.map((r, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm hover:shadow-md transition"
          >
            {/* Stars */}
            <div className="flex mb-2">
              {[...Array(5)].map((_, idx) =>
                idx < (r.rating || 0) ? (
                  <FaStar key={idx} className="text-orange-400" />
                ) : (
                  <FaRegStar key={idx} className="text-gray-300" />
                )
              )}
            </div>

            {/* Comment */}
            <p className="text-gray-700 text-sm mb-3 italic line-clamp-4">
              "{r.comment}"
            </p>

            {/* Reviewer info */}
            <div className="text-sm text-gray-600">
              <strong>{r.reviewerName || "Anonymous"}</strong>
              {r.createdAt && (
                <span className="block text-[12px] text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nút xem thêm */}
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
    </section>
  );
}
