import React, { useEffect, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function Reviews({ tourId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${tourId}/reviews`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        setReviews(data._embedded ? data._embedded.reviews : data);
      } catch (err) {
        console.error("❌ Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [tourId]);

  if (!reviews.length)
    return (
      <section className="max-w-6xl mx-auto px-6 py-10 text-gray-500">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Reviews</h2>
        <p>No reviews yet for this tour.</p>
      </section>
    );

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-10">Reviews</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
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

            <p className="text-gray-700 text-sm mb-3 italic">"{r.comment}"</p>

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
    </section>
  );
}
