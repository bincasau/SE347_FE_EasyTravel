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
} from "date-fns";

export default function DaysAvailable() {
  const today = new Date();

  // Tháng đang xem
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  // Những ngày đã có lịch (booked) - demo data
  const [bookedDays] = useState(() => {
    return new Set([
      format(addDays(today, 1), "yyyy-MM-dd"),
      format(addDays(today, 2), "yyyy-MM-dd"),
      format(addDays(today, 6), "yyyy-MM-dd"),
      "2025-12-17",
    ]);
  });

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

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isBooked = (dateObj) =>
    bookedDays.has(format(dateObj, "yyyy-MM-dd"));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* TITLE */}
      <h1 className="text-3xl font-bold text-center text-orange-500 mb-2">
        Days Available
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Days that already have schedule (booked).
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

      {/* LEGEND (KHÔNG CÒN CLEAR) */}
      <div className="flex flex-wrap gap-4 items-center mb-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-orange-500 inline-block" />
          Booked (has schedule)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-gray-100 border inline-block" />
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

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dateObj) => {
            const otherMonth = !isSameMonth(dateObj, currentMonth);
            const booked = isBooked(dateObj);

            let cls =
              "h-12 rounded-xl flex items-center justify-center text-sm border";

            if (otherMonth) cls += " opacity-40";

            if (booked)
              cls += " bg-orange-500 text-white border-orange-500";
            else
              cls += " bg-white border-gray-200 text-gray-700";

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

      {/* NOTE */}
      <p className="text-xs text-gray-500 mt-4">
        Orange days indicate booked schedules.
      </p>
    </div>
  );
}
