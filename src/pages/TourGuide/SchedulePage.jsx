import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  format,
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

  // ✅ map tours -> eventsList (lọc theo tháng đang xem)
  const eventsList = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const safeParse = (d) => {
      try {
        // backend đang trả "2025-12-10" => parseISO ok
        return d ? parseISO(d) : null;
      } catch {
        return null;
      }
    };

    // tour -> event, gắn vào đúng "ngày startDate"
    const toursInMonth = rawTours
      .map((t) => {
        const start = safeParse(t.startDate);
        const end = safeParse(t.endDate);
        if (!start) return null;

        // lọc: startDate thuộc tháng đang xem
        const inMonth = isWithinInterval(start, { start: monthStart, end: monthEnd });
        if (!inMonth) return null;

        return {
          id: t.tourId,
          title: t.title,
          img: toS3TourImage(t.mainImage),
          from: t.startDate,
          to: t.endDate,
          time: t.time || "—", // nếu backend có field time thì xài, không thì —
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
  const totalPages = Math.ceil(eventsList.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleEvents = eventsList.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentMonth]);

  /* MONTH NAV LOGIC */
  const canGoPrev = isAfter(startOfMonth(currentMonth), startOfMonth(today));

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

      {!loading && !errMsg && totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
