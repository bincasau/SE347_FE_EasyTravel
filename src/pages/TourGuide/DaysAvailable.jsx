import { useMemo, useState } from "react";
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
  isWithinInterval,
  max as dfMax,
  min as dfMin,
  addWeeks,
  isAfter,
} from "date-fns";

export default function DaysAvailable() {
  const today = new Date();

  // Tháng đang xem
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  // Demo tours có range (from -> to)
  const tours = useMemo(
    () => [
      {
        id: 101,
        title: "Lucca Bike Tour",
        from: format(addDays(today, 1), "yyyy-MM-dd"),
        to: format(addDays(today, 3), "yyyy-MM-dd"),
      },
      {
        id: 102,
        title: "Florence Cultural Tour",
        from: format(addDays(today, 6), "yyyy-MM-dd"),
        to: format(addDays(today, 10), "yyyy-MM-dd"),
      },
      {
        id: 103,
        title: "Future Tour",
        from: "2025-12-15",
        to: "2025-12-18",
      },
    ],
    [today]
  );

  // Những ngày booked = union tất cả ngày trong tours
  const bookedDays = useMemo(() => {
    const s = new Set();
    for (const t of tours) {
      let d = parseISO(t.from);
      const end = parseISO(t.to);
      while (!isAfter(d, end)) {
        s.add(format(d, "yyyy-MM-dd"));
        d = addDays(d, 1);
      }
    }
    return s;
  }, [tours]);

  // Tạo grid ngày của tháng
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

  // Chia thành các tuần (mỗi tuần 7 ngày)
  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      w.push(calendarDays.slice(i, i + 7));
    }
    return w;
  }, [calendarDays]);

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isBooked = (dateObj) => bookedDays.has(format(dateObj, "yyyy-MM-dd"));

  // Helper: clamp tour range vào range của tuần để vẽ bar
  const getWeekBars = (weekDays) => {
    const weekStart = startOfWeek(weekDays[0], { weekStartsOn: 0 });
    const weekEnd = endOfWeek(weekDays[0], { weekStartsOn: 0 });

    const bars = [];
    for (const t of tours) {
      const tStart = parseISO(t.from);
      const tEnd = parseISO(t.to);

      // tour có giao với tuần này không?
      const overlapStart = dfMax([tStart, weekStart]);
      const overlapEnd = dfMin([tEnd, weekEnd]);
      if (isAfter(overlapStart, overlapEnd)) continue;

      // cột bắt đầu/kết thúc trong tuần: 1..7
      const startIdx = Math.round((overlapStart - weekStart) / (1000 * 60 * 60 * 24)); // 0..6
      const endIdx = Math.round((overlapEnd - weekStart) / (1000 * 60 * 60 * 24)); // 0..6

      bars.push({
        id: `${t.id}-${format(weekStart, "yyyy-MM-dd")}`,
        title: t.title,
        colStart: startIdx + 1, // grid columns start at 1
        colEnd: endIdx + 2, // end is exclusive
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
                {/* Bars overlay (behind day cells) */}
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

                    // nếu thuộc tour: highlight nhẹ để người ta thấy day thuộc range
                    if (booked)
                      cls += " bg-orange-50 border-orange-200 text-gray-800";
                    else cls += " bg-white border-gray-200 text-gray-700";

                    return (
                      <div key={format(dateObj, "yyyy-MM-dd")} className={cls}>
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
    </div>
  );
}
