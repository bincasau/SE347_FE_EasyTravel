import React, { useEffect, useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const BASE_URL = "http://localhost:8080";
const S3_BASE = "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

const buildS3Url = (fileOrUrl) => {
  if (!fileOrUrl) return "";
  const s = String(fileOrUrl).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `${S3_BASE}/${s.replace(/^\/+/, "")}`;
};

export default function TourGallery({ tourId }) {
  const [images, setImages] = useState([]); // ✅ urls từ backend
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchImages = async () => {
      if (!tourId) return;

      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/tours/${tourId}/images`);
        if (!res.ok) throw new Error("Không thể tải danh sách ảnh tour");

        const data = await res.json();
        const list = data?._embedded?.images;

        const mapped = Array.isArray(list)
          ? list
              .map((it) => ({
                imageId: it?.imageId ?? 0,
                createdAt: it?.createdAt,
                url: buildS3Url(it?.url),
              }))
              .filter((x) => x.url)
          : [];

        // sort ổn định
        mapped.sort((a, b) => {
          const ia = Number(a.imageId || 0);
          const ib = Number(b.imageId || 0);
          if (ia && ib) return ia - ib;
          const ta = new Date(a.createdAt || 0).getTime();
          const tb = new Date(b.createdAt || 0).getTime();
          return (ta || 0) - (tb || 0);
        });

        const urls = Array.from(new Set(mapped.map((x) => x.url)));

        if (!alive) return;
        setImages(urls);
        setIndex(0);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setImages([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchImages();
    return () => {
      alive = false;
    };
  }, [tourId]);

  const total = images.length;

  const atStart = index === 0;
  const atEnd = index >= total - 1;

  const next = () => {
    if (!atEnd) setIndex((i) => i + 1);
  };
  const prev = () => {
    if (!atStart) setIndex((i) => i - 1);
  };

  // ✅ chỉ cần 3 tấm: current (lớn), next1, next2
  const current = images[index];
  const next1 = images[index + 1] || null;
  const next2 = images[index + 2] || null;

  // ✅ danh sách ảnh nhỏ: chỉ push cái nào tồn tại (không đủ ảnh thì không hiện ô)
  const sideImages = useMemo(() => {
    const arr = [];
    if (next1) arr.push(next1);
    if (next2) arr.push(next2);
    return arr;
  }, [next1, next2]);

  if (!tourId) return null;

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

  return (
    <section className="max-w-6xl mx-auto px-6 mt-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-semibold text-gray-800">Gallery Tour</h2>

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
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/tour/fallback.jpg";
          }}
        />

        {/* Ảnh nhỏ: chỉ hiện nếu tồn tại */}
        {sideImages.length > 0 && (
          <div className="flex flex-col gap-4 w-full md:w-1/3">
            {sideImages.map((src, i) => (
              <img
                key={`${tourId}-${index}-${i}`}
                src={src}
                alt={`tour-${tourId}-preview-${i + 1}`}
                className="h-[195px] w-full object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/tour/fallback.jpg";
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
