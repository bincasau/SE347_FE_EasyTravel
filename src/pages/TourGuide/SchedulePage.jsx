import { useEffect, useMemo, useState, useCallback } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isAfter,
  isWithinInterval,
  parseISO,
} from "date-fns";
import Pagination from "@/utils/Pagination";
import MonthHeader from "../../components/pages/TourGuide/schedule/MonthHeader";
import EventList from "../../components/pages/TourGuide/schedule/EventList";

const API_BASE = "http://localhost:8080";

const S3_TOUR_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/tour";
const FALLBACK_IMAGE = `${S3_TOUR_BASE}/tour_default.jpg`;

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);

  const [rawTours, setRawTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const pageSize = 5;
  const today = new Date();

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
      console.error("[FETCH ERROR]", url, res.status, text);
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

  // ✅ load upcoming tours
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetchWithAuth(`${API_BASE}/tour_guide/upcoming`);
        const data = await res.json();

        const list = Array.isArray(data?.content) ? data.content : [];
        if (mounted) setRawTours(list);
      } catch (e) {
        console.error("[UPCOMING TOURS ERROR]", e);
        if (mounted) {
          setRawTours([]);
          setErrMsg(e?.message || "Fetch upcoming tours failed");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* BUILD EVENTS */
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);
  // ^ daysInMonth bạn chưa dùng, nhưng giữ lại cũng không sao

  // ✅ map tours -> eventsList (lọc theo tháng đang xem)
  const eventsList = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const safeParse = (d) => {
      try {
        return d ? parseISO(d) : null;
      } catch {
        return null;
      }
    };

    const toursInMonth = rawTours
      .map((t) => {
        const start = safeParse(t.startDate);
        if (!start) return null;

        // lọc: startDate thuộc tháng đang xem
        const inMonth = isWithinInterval(start, {
          start: monthStart,
          end: monthEnd,
        });
        if (!inMonth) return null;

        return {
          id: t.tourId,
          title: t.title,
          img: toS3TourImage(t.mainImage),
          from: t.startDate,
          to: t.endDate,
          task: t.description || "",
          dayObj: start,
        };
      })
      .filter(Boolean);

    // sort theo ngày start giảm dần
    toursInMonth.sort((a, b) => b.dayObj - a.dayObj);

    return toursInMonth;
  }, [rawTours, currentMonth]);

  /* PAGINATION */
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(eventsList.length / pageSize));
  }, [eventsList.length]);

  // nếu eventsList thay đổi làm currentPage vượt totalPages => kéo về trang cuối hợp lệ
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const visibleEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return eventsList.slice(startIndex, startIndex + pageSize);
  }, [eventsList, currentPage]);

  // đổi tháng => về page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [currentMonth]);

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

  /* MONTH NAV LOGIC */
  const canGoPrev = isAfter(startOfMonth(currentMonth), startOfMonth(today));

  // chỉ show pagination khi thực sự > 1 trang
  const shouldShowPagination = !loading && !errMsg && eventsList.length > pageSize;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <MonthHeader
        month={currentMonth}
        onNext={() => setCurrentMonth(addMonths(currentMonth, 1))}
        onPrev={() => setCurrentMonth(subMonths(currentMonth, 1))}
        canGoPrev={canGoPrev}
      />

      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading...</div>
      ) : errMsg ? (
        <div className="text-center text-red-500 py-10">{errMsg}</div>
      ) : (
        <EventList events={visibleEvents} />
      )}

      {shouldShowPagination && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            visiblePages={visiblePages}
          />
        </div>
      )}
    </div>
  );
}
