import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function TourGallery({ tourId }) {
  const [images, setImages] = useState([]); // ✅ 5 link S3
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const S3_BASE =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

  useEffect(() => {
    if (!tourId) return;

    setLoading(true);

    // ✅ build 5 ảnh theo tourId
    const list = Array.from({ length: 5 }, (_, idx) => {
      const n = idx + 1;
      return `${S3_BASE}/tour_${tourId}_img_${n}.jpg`;
    });

    setImages(list);
    setIndex(0);
    setLoading(false);
  }, [tourId]);

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Đang tải ảnh...</p>;
  }

  if (images.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Không có ảnh cho tour này.
      </p>
    );
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
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-podcast text-gray-800">Gallery Tour</h2>

        {/* Nút điều hướng */}
        <div className="flex gap-3">
          <button
            onClick={prev}
            disabled={atStart}
            aria-label="Previous"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition
              ${
                atStart
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white"
              }`}
          >
            <FaChevronLeft size={16} />
          </button>

          <button
            onClick={next}
            disabled={atEnd}
            aria-label="Next"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition
              ${
                atEnd
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white"
              }`}
          >
            <FaChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Ảnh lớn */}
        <img
          src={current}
          alt={`tour-${tourId}-img-${index + 1}`}
          className="w-full md:w-2/3 h-[400px] object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
          onError={(e) => {
            e.currentTarget.src = "/images/tour/fallback.jpg";
          }}
        />

        {/* Hai ảnh nhỏ */}
        <div className="flex flex-col gap-4 w-full md:w-1/3">
          {[next1, next2].map((src, i) => (
            <img
              key={`${tourId}-${index}-${i}`}
              src={src}
              alt={`tour-${tourId}-preview-${i + 1}`}
              className="h-[195px] w-full object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
              onError={(e) => {
                e.currentTarget.src = "/images/tour/fallback.jpg";
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
