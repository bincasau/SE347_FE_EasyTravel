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
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0); // ✅ page index (mỗi page = 3 ảnh)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchImages = async () => {
      if (!tourId) return;

      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/tours/${tourId}/images`, {
          cache: "no-store",
        });
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
        setPage(0);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setImages([]);
        setPage(0);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchImages();
    return () => {
      alive = false;
    };
  }, [tourId]);

  // ✅ tạo pages, chỉ lấy những page đủ 3 ảnh
  const pages = useMemo(() => {
    const res = [];
    for (let i = 0; i < images.length; i += 3) {
      const chunk = images.slice(i, i + 3);
      if (chunk.length === 3) res.push(chunk); // ✅ chỉ nhận đủ 3
      else {
        // ✅ dồn phần lẻ vào trang trước (nếu có)
        if (res.length > 0) {
          res[res.length - 1] = [...res[res.length - 1], ...chunk].slice(0, 3);
        }
      }
    }
    return res;
  }, [images]);

  const totalPages = pages.length;
  const safePage = Math.max(0, Math.min(page, totalPages - 1));

  const atStart = safePage === 0;
  const atEnd = safePage >= totalPages - 1;

  const prev = () => {
    if (!atStart) setPage((p) => p - 1);
  };
  const next = () => {
    if (!atEnd) setPage((p) => p + 1);
  };

  if (!tourId) return null;

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Đang tải ảnh...</p>;
  }

  // ✅ không có ảnh hoặc không đủ page
  if (pages.length === 0) return null;

  const [current, ...sideImages] = pages[safePage]; // current=ảnh lớn, sideImages tối đa 2

  return (
    <section className="max-w-6xl mx-auto px-6 mt-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-semibold text-gray-800">Gallery Tour</h2>

        {/* Nút điều hướng */}
        {totalPages > 1 && (
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
        )}
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Ảnh lớn */}
        <div className={sideImages.length > 0 ? "w-full md:w-2/3" : "w-full"}>
          <img
            src={current}
            alt={`tour-${tourId}-img-page-${safePage}-main`}
            className="w-full h-[400px] object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
          />
        </div>

        {/* Ảnh nhỏ */}
        {sideImages.length > 0 && (
          <div className="flex flex-col gap-4 w-full md:w-1/3">
            {sideImages.slice(0, 2).map((src, i) => (
              <img
                key={`${tourId}-page-${safePage}-side-${i}`}
                src={src}
                alt={`tour-${tourId}-page-${safePage}-side-${i + 1}`}
                className="h-[195px] w-full object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
