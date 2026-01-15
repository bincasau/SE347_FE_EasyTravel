import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Pagination from "@/utils/Pagination";

const API_BASE = "http://localhost:8080";

// ✅ tour image S3 (bạn đổi lại nếu bucket path khác)
const S3_TOUR_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/tour";
const FALLBACK_IMAGE = `${S3_TOUR_BASE}/tour_default.jpg`;

export default function PastTours() {
  const [sortOrder, setSortOrder] = useState("newest");
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // ✅ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // bạn đổi 4/6/8 tùy ý

  // ✅ lấy token
  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  // ✅ fetch auto gửi JWT
  const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    return res;
  };

  const toS3TourImage = (fileName) => {
    if (!fileName) return FALLBACK_IMAGE;
    const s = String(fileName);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    return `${S3_TOUR_BASE}/${s}`;
  };

  // ✅ map API -> UI
  const normalizeTour = (t) => {
    const durationText =
      t?.durationDays != null ? `${t.durationDays} days` : "--";

    const dateStr = t?.endDate || t?.startDate || t?.createdAt || "";

    return {
      tourId: t.tourId,
      title: t.title,
      date: dateStr,
      duration: durationText,
      image: toS3TourImage(t.mainImage),
      status: t.status,
      destination: t.destination,
      departureLocation: t.departureLocation,
      priceAdult: t.priceAdult,
      percentDiscount: t.percentDiscount,
    };
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetchWithAuth(`${API_BASE}/tour_guide/history`);
        const data = await res.json();

        const list = Array.isArray(data?.content) ? data.content : [];
        const normalized = list.map(normalizeTour);

        if (mounted) setTours(normalized);
      } catch (e) {
        console.error("[PAST TOURS FETCH ERROR]", e);
        if (mounted) {
          setTours([]);
          setErrMsg(e?.message || "Fetch failed");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedTours = useMemo(() => {
    const arr = [...tours];
    const toTime = (d) => {
      const x = new Date(d);
      return Number.isNaN(x.getTime()) ? 0 : x.getTime();
    };

    arr.sort((a, b) =>
      sortOrder === "newest"
        ? toTime(b.date) - toTime(a.date)
        : toTime(a.date) - toTime(b.date)
    );

    return arr;
  }, [tours, sortOrder]);

  // ✅ reset trang khi đổi sort
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedTours.length / pageSize));
  }, [sortedTours.length]);

  // nếu data đổi làm currentPage vượt totalPages => kéo về trang cuối hợp lệ
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedTours = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedTours.slice(start, end);
  }, [sortedTours, currentPage]);

  // ✅ visible pages (gọn 3-5 nút)
  const getVisiblePages = useCallback((page, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    if (page === 1) return [1, 2, 3];
    if (page === 2) return [1, 2, 3, 4];
    if (page === 3) return [1, 2, 3, 4, 5];

    if (page === total) return [total - 2, total - 1, total];
    if (page === total - 1) return [total - 3, total - 2, total - 1, total];
    if (page === total - 2)
      return [total - 4, total - 3, total - 2, total - 1, total];

    const start = Math.max(1, page - 2);
    const end = Math.min(total, page + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, []);

  const visiblePages = useMemo(() => {
    return getVisiblePages(currentPage, totalPages);
  }, [currentPage, totalPages, getVisiblePages]);

  const formatDate = (d) => {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return "--";
    return x.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-center text-orange-500 mb-12">
        Past Tours
      </h2>

      {/* SORT */}
      <div className="flex justify-end mb-6">
        <select
          className="border rounded-full px-4 py-2 text-sm bg-white"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Gần nhất → Xa nhất</option>
          <option value="oldest">Xa nhất → Gần nhất</option>
        </select>
      </div>

      {/* STATE */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading...</div>
      ) : errMsg ? (
        <div className="text-center text-red-500 py-10">{errMsg}</div>
      ) : sortedTours.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          Không có tour đã đi.
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {pagedTours.map((tour) => (
              <div
                key={tour.tourId}
                className="bg-white shadow rounded-xl p-4 flex items-center gap-6 hover:shadow-lg transition"
              >
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-40 h-32 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold line-clamp-1">
                    {tour.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    📅 {formatDate(tour.date)}
                  </p>

                  <p className="text-sm text-gray-500">⏳ {tour.duration}</p>

                  {(tour.departureLocation || tour.destination) && (
                    <p className="text-sm text-gray-500">
                      📍 {tour.departureLocation || "--"} →{" "}
                      {tour.destination || "--"}
                    </p>
                  )}

                  {tour.status && (
                    <p className="text-xs mt-1 inline-block px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                      {tour.status}
                    </p>
                  )}
                </div>

                <Link
                  to={`/detailtour/${tour.tourId}`}
                  state={{ hideBookNow: true }}
                  className="px-5 py-2 border border-orange-400 text-orange-500 rounded-full hover:bg-orange-100 whitespace-nowrap"
                >
                  View Tour
                </Link>
              </div>
            ))}
          </div>

          {/* ✅ Pagination dưới cùng */}
          {sortedTours.length > pageSize && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              visiblePages={visiblePages}
            />
          )}
        </>
      )}
    </div>
  );
}
