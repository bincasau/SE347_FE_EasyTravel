import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  parseISO,
  max as dfMax,
  min as dfMin,
  isAfter,
} from "date-fns";

const API_BASE = "http://localhost:8080";

export default function DaysAvailable() {
  const today = new Date();

  // Tháng đang xem
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  // ✅ tours fetched
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // ✅ lấy token (tự thử nhiều key phổ biến)
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

  // ✅ fetch schedule theo month/year mỗi khi đổi tháng
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const month = currentMonth.getMonth() + 1; // JS 0..11 -> API 1..12
        const year = currentMonth.getFullYear();

        const res = await fetchWithAuth(
          `${API_BASE}/tour_guide/schedule?month=${month}&year=${year}`
        );
        const data = await res.json();

        const list = Array.isArray(data?.content) ? data.content : [];

        // normalize tours: from/to = startDate/endDate
        const normalized = list.map((t) => ({
          id: t.tourId,
          title: t.title,
          from: t.startDate, // "yyyy-MM-dd"
          to: t.endDate,     // "yyyy-MM-dd"
        }));

        if (mounted) setTours(normalized);
      } catch (e) {
        console.error("[SCHEDULE FETCH ERROR]", e);
        if (mounted) {
          setTours([]);
          setErrMsg(e?.message || "Failed to load schedule");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentMonth]);

  // ✅ Những ngày booked = union tất cả ngày trong tours
  const bookedDays = useMemo(() => {
    const s = new Set();

    for (const t of tours) {
      if (!t?.from || !t?.to) continue;

      let d = parseISO(t.from);
      const end = parseISO(t.to);

      // guard nếu date lỗi
      if (Number.isNaN(d.getTime()) || Number.isNaN(end.getTime())) continue;

      while (!isAfter(d, end)) {
        s.add(format(d, "yyyy-MM-dd"));
        d = addDays(d, 1);
      }
    }

    return s;
  }, [tours]);

  // ✅ Tạo grid ngày của tháng
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [currentMonth]);

  // ✅ Chia thành các tuần (mỗi tuần 7 ngày)
  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      w.push(calendarDays.slice(i, i + 7));
    }
    return w;
  }, [calendarDays]);

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isBooked = (dateObj) => bookedDays.has(format(dateObj, "yyyy-MM-dd"));

  // ✅ clamp tour range vào range của tuần để vẽ bar
  const getWeekBars = (weekDays) => {
    const weekStart = startOfWeek(weekDays[0], { weekStartsOn: 0 });
    const weekEnd = endOfWeek(weekDays[0], { weekStartsOn: 0 });

    const bars = [];
    for (const t of tours) {
      if (!t?.from || !t?.to) continue;

      const tStart = parseISO(t.from);
      const tEnd = parseISO(t.to);

      if (Number.isNaN(tStart.getTime()) || Number.isNaN(tEnd.getTime()))
        continue;

      // overlap với tuần?
      const overlapStart = dfMax([tStart, weekStart]);
      const overlapEnd = dfMin([tEnd, weekEnd]);
      if (isAfter(overlapStart, overlapEnd)) continue;

      // cột bắt đầu/kết thúc trong tuần: 1..7
      const startIdx = Math.round(
        (overlapStart - weekStart) / (1000 * 60 * 60 * 24)
      ); // 0..6
      const endIdx = Math.round(
        (overlapEnd - weekStart) / (1000 * 60 * 60 * 24)
      ); // 0..6

      bars.push({
        id: `${t.id}-${format(weekStart, "yyyy-MM-dd")}`,
        title: t.title,
        colStart: startIdx + 1,
        colEnd: endIdx + 2, // exclusive
      });
    }
    return bars;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-center text-orange-500 mb-2">
        Days Available
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Orange bars connect days that belong to the same tour.
      </p>

      {/* HEADER (MONTH NAV) */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="px-4 py-2 rounded-full border border-orange-400 text-orange-500 hover:bg-orange-50"
        >
          ← Previous
        </button>

        <div className="text-xl font-semibold text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </div>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-400"
        >
          Next →
        </button>
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-4 items-center mb-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-6 h-3 rounded bg-orange-400 inline-block" />
          Tour range (connected)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-orange-50 border border-orange-200 inline-block" />
          Day in tour
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-white border border-gray-200 inline-block" />
          Normal day
        </div>
      </div>

      {/* STATE */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : errMsg ? (
        <div className="text-center text-red-500 py-8">{errMsg}</div>
      ) : (
        <>
          {/* CALENDAR */}
          <div className="bg-white border rounded-2xl shadow-sm p-5 select-none">
            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
              {weekdayLabels.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-gray-500 py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex flex-col gap-2">
              {weeks.map((weekDays, wIdx) => {
                const bars = getWeekBars(weekDays);

                return (
                  <div key={wIdx} className="relative">
                    {/* Bars overlay */}
                    <div className="absolute inset-0 grid grid-cols-7 gap-2 pointer-events-none">
                      {bars.map((b) => (
                        <div
                          key={b.id}
                          style={{ gridColumn: `${b.colStart} / ${b.colEnd}` }}
                          className="h-12 flex items-center"
                        >
                          <div
                            className="w-full h-3 rounded-full bg-orange-400/80 shadow-sm"
                            title={b.title}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-2 relative">
                      {weekDays.map((dateObj) => {
                        const otherMonth = !isSameMonth(dateObj, currentMonth);
                        const booked = isBooked(dateObj);

                        let cls =
                          "h-12 rounded-xl flex items-center justify-center text-sm border relative";

                        if (otherMonth) cls += " opacity-40";

                        if (booked)
                          cls += " bg-orange-50 border-orange-200 text-gray-800";
                        else cls += " bg-white border-gray-200 text-gray-700";

                        return (
                          <div
                            key={format(dateObj, "yyyy-MM-dd")}
                            className={cls}
                          >
                            {format(dateObj, "d")}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Tip: Hover the orange bar to see tour title.
          </p>
        </>
      )}
    </div>
  );
}
