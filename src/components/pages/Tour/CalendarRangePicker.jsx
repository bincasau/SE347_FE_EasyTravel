import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  toYMDFromDateObj,
  startOfDayTs,
  compareYMD,
  addMonths,
  monthLabel,
  daysInMonth,
  firstDayOfMonth,
} from "@/utils/tourUtils";

export default function CalendarRangePicker({
  month,
  onMonthChange,
  minYMD,
  startYMD,
  endYMD,
  onPick,
  t,
}) {
  const y = month.getFullYear();
  const m = month.getMonth();

  const totalDays = daysInMonth(y, m);
  const offset = firstDayOfMonth(y, m);

  const startTs = startYMD ? startOfDayTs(new Date(startYMD)) : Number.NaN;
  const endTs = endYMD ? startOfDayTs(new Date(endYMD)) : Number.NaN;

  const isBetween = (ts) =>
    Number.isFinite(startTs) &&
    Number.isFinite(endTs) &&
    ts > Math.min(startTs, endTs) &&
    ts < Math.max(startTs, endTs);

  const pickDay = (dayNum) => {
    const ymd = toYMDFromDateObj(new Date(y, m, dayNum));
    if (minYMD && compareYMD(ymd, minYMD) < 0) return;

    if (!startYMD) {
      onPick({ startYMD: ymd, endYMD: "" });
      return;
    }

    if (startYMD && !endYMD) {
      if (compareYMD(ymd, startYMD) < 0) onPick({ startYMD: ymd, endYMD: "" });
      else onPick({ startYMD, endYMD: ymd });
      return;
    }

    onPick({ startYMD: ymd, endYMD: "" });
  };

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          className="w-9 h-9 grid place-items-center rounded-xl border hover:bg-gray-50"
          aria-label="Previous month"
        >
          <FaChevronLeft />
        </button>

        <div className="font-semibold text-gray-800">{monthLabel(month)}</div>

        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="w-9 h-9 grid place-items-center rounded-xl border hover:bg-gray-50"
          aria-label="Next month"
        >
          <FaChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 text-[11px] text-gray-500 mb-1">
        {weekdays.map((w) => (
          <div key={w} className="text-center py-1 font-semibold">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dayNum, idx) => {
          if (!dayNum) return <div key={`b-${idx}`} className="h-9" />;

          const ymd = toYMDFromDateObj(new Date(y, m, dayNum));
          const ts = startOfDayTs(new Date(y, m, dayNum));

          const disabled = minYMD && compareYMD(ymd, minYMD) < 0;
          const isStart = startYMD && ymd === startYMD;
          const isEnd = endYMD && ymd === endYMD;
          const between = isBetween(ts);

          const base =
            "h-9 rounded-xl text-sm flex items-center justify-center select-none transition";

          const cls = disabled
            ? `${base} text-gray-300 cursor-not-allowed`
            : isStart || isEnd
            ? `${base} bg-orange-500 text-white font-semibold`
            : between
            ? `${base} bg-orange-100 text-gray-800`
            : `${base} hover:bg-gray-100 text-gray-700`;

          return (
            <button
              key={`d-${idx}`}
              type="button"
              className={cls}
              onClick={() => pickDay(dayNum)}
              disabled={disabled}
              title={ymd}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Tip: {t("tourPage.tipClickDate")}
      </div>
    </div>
  );
}
