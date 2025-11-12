import React, { useState, useEffect } from "react";

export default function TourGallery({ tourId }) {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tourId) return;

    // Gọi API: /tours/{id}/images
    fetch(`http://localhost:8080/tours/${tourId}/images`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch images");
        return res.json();
      })
      .then((data) => {
        setImages(data._embedded?.images || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching images:", err);
        setLoading(false);
      });
  }, [tourId]);

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Đang tải ảnh...</p>;
  }

  if (images.length === 0) {
    return <p className="text-center text-gray-500 mt-10">Không có ảnh cho tour này.</p>;
  }

  const atStart = index === 0;
  const atEnd = index === images.length - 1;

  const next = () => {
    if (!atEnd) setIndex((i) => i + 1);
  };
  const prev = () => {
    if (!atStart) setIndex((i) => i - 1);
  };

  const current = images[index];
  const next1 = images[index + 1] || images[0];
  const next2 = images[index + 2] || images[1];

  return (
    <section className="max-w-6xl mx-auto px-6 mt-10">
      {/* Header + nút điều hướng */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-podcast text-gray-800">
          Gallery Tour
        </h2>

        <div className="flex gap-3">
          <button
            onClick={prev}
            disabled={atStart}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition
              ${
                atStart
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white"
              }`}
            aria-label="Previous"
          >
            ←
          </button>

          <button
            onClick={next}
            disabled={atEnd}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition
              ${
                atEnd
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white"
              }`}
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>

      {/* Layout: 1 ảnh lớn + 2 ảnh nhỏ */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Ảnh lớn */}
        <img
          src={`/images/tour/${current.url}`} // ✅ load ảnh từ public/images/tour/
          alt={current.altText || current.title}
          className="w-full md:w-2/3 h-[400px] object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
        />

        {/* Hai ảnh nhỏ */}
        <div className="flex flex-col gap-4 w-full md:w-1/3">
          {[next1, next2].map((img, i) => (
            <img
              key={i}
              src={`/images/tour/${img.url}`} // ✅ load ảnh từ public/images/tour/
              alt={img.altText || img.title}
              className="h-[195px] object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
