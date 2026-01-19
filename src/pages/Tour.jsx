import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaFilter,
  FaSearch,
  FaSortAmountDownAlt,
  FaSortAmountUpAlt,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { filterTours, getDepartureLocations } from "../apis/Tour";
import TourCard from "../components/pages/Tour/TourCard";
import Pagination from "../utils/Pagination";
import BookingVideo from "../components/pages/Tour/Video";
import Tour from "../models/Tour";

// ✅ ScrollToTop component (bạn đã có)
import ScrollToTop from "../utils/ScrollToTop";

const pad2 = (n) => String(n).padStart(2, "0");

const toYMDFromDateObj = (d) => {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
};

const ymdToDMY = (ymd) => {
  if (!ymd) return "";
  const [y, m, d] = String(ymd).split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
};

const dmyToYMD = (dmy) => {
  if (!dmy) return "";
  const s = String(dmy).trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);

  if (mm < 1 || mm > 12) return "";
  if (dd < 1 || dd > 31) return "";

  const dt = new Date(yyyy, mm - 1, dd);
  if (
    dt.getFullYear() !== yyyy ||
    dt.getMonth() !== mm - 1 ||
    dt.getDate() !== dd
  )
    return "";

  return `${String(yyyy).padStart(4, "0")}-${String(mm).padStart(
    2,
    "0",
  )}-${String(dd).padStart(2, "0")}`;
};

const formatDMYInput = (value) => {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 8);
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  let out = d;
  if (digits.length >= 3) out += "/" + m;
  if (digits.length >= 5) out += "/" + y;
  return out;
};

const startOfDayTs = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const compareYMD = (a, b) => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

const addMonths = (dateObj, delta) =>
  new Date(dateObj.getFullYear(), dateObj.getMonth() + delta, 1);

const monthLabel = (dateObj) => {
  const m = dateObj.toLocaleString("en-US", { month: "long" });
  return `${m} ${dateObj.getFullYear()}`;
};

const daysInMonth = (y, mIndex) => new Date(y, mIndex + 1, 0).getDate();
const firstDayOfMonth = (y, mIndex) => new Date(y, mIndex, 1).getDay();

function CalendarRangePicker({
  month,
  onMonthChange,
  minYMD,
  startYMD,
  endYMD,
  onPick,
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
        Tip: Click 1 ngày để chọn <b>Start</b>, click lần 2 để chọn <b>End</b>.
      </div>
    </div>
  );
}

export default function TourPage() {
  const location = useLocation();
  const nav = useNavigate();

  // ✅ state change scroll (pagination/filter/sort/search/date là state)
  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return toYMDFromDateObj(d);
  }, []);

  useEffect(() => {
    if (location.search) {
      nav(location.pathname, { replace: true, state: location.state });
    }
  }, [location.search, location.pathname, location.state, nav]);

  const [tours, setTours] = useState([]);
  const [locations, setLocations] = useState([]);
  const [durations] = useState(["", 2, 3, 4, 5, 7, 10]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [draftSearch, setDraftSearch] = useState("");

  const [sortOrder, setSortOrder] = useState("recent");

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");

  const [draftDate, setDraftDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  const [dateError, setDateError] = useState("");

  const [draftLocation, setDraftLocation] = useState("");
  const [draftDuration, setDraftDuration] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [mobilePanel, setMobilePanel] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 8;

  const [calMonth, setCalMonth] = useState(() => {
    const dt = new Date(minDate);
    return new Date(dt.getFullYear(), dt.getMonth(), 1);
  });

  const lastHeroKeyRef = useRef("");

  useEffect(() => {
    const s = location.state;
    if (!s) return;

    const heroStart = s.startDate || "";
    const heroEnd = s.endDate || "";
    const heroLocRaw = s.departureLocation ?? s.departure ?? "";
    const heroDurRaw = s.durationDay ?? s.durationDays ?? "";

    const heroLoc = heroLocRaw ? String(heroLocRaw) : "";
    const heroDur =
      heroDurRaw !== undefined && heroDurRaw !== null && heroDurRaw !== ""
        ? String(heroDurRaw)
        : "";

    const heroKey = JSON.stringify({ heroStart, heroEnd, heroLoc, heroDur });
    if (lastHeroKeyRef.current === heroKey) return;
    lastHeroKeyRef.current = heroKey;

    setCurrentPage(1);

    if (heroStart) {
      const finalStart = compareYMD(heroStart, minDate) < 0 ? minDate : heroStart;
      setSelectedDate(finalStart);
      setDraftDate(ymdToDMY(finalStart));
      const dt = new Date(finalStart);
      setCalMonth(new Date(dt.getFullYear(), dt.getMonth(), 1));
      setDateError("");
    } else {
      setSelectedDate("");
      setDraftDate("");
      setDateError("");
    }

    if (heroEnd) {
      setSelectedEndDate(String(heroEnd));
      setDraftEndDate(ymdToDMY(String(heroEnd)));
    } else {
      setSelectedEndDate("");
      setDraftEndDate("");
    }

    setSelectedLocation(heroLoc);
    setDraftLocation(heroLoc);

    setSelectedDuration(heroDur);
    setDraftDuration(heroDur);

    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDraftSearch("");

    scrollTop();
  }, [location.state, minDate, scrollTop]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const list = await getDepartureLocations();
        setLocations(["", ...(Array.isArray(list) ? list : [])]);
      } catch (error) {
        console.error("Error fetching departure locations:", error);
        setLocations([
          "",
          "Đà Lạt",
          "Phú Quốc",
          "Sa Pa",
          "Hội An",
          "Nha Trang",
          "Hạ Long",
          "Đà Nẵng",
          "Huế",
          "Côn Đảo",
        ]);
      }
    };
    loadLocations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const applySearchDraft = useCallback(() => {
    setSearchTerm(draftSearch);
    setCurrentPage(1);
    scrollTop();
  }, [draftSearch, scrollTop]);

  const closeDesktopPop = () => {
    setShowFilter(false);
    setShowSort(false);
    setShowDatePicker(false);
  };

  const applyFilterDraft = useCallback(() => {
    setSelectedLocation(draftLocation);
    setSelectedDuration(draftDuration);
    setCurrentPage(1);
    setShowFilter(false);
    setMobilePanel(null);
    scrollTop();
  }, [draftLocation, draftDuration, scrollTop]);

  const clearFilterDraft = useCallback(() => {
    setDraftLocation("");
    setDraftDuration("");
  }, []);

  const clearDateOnly = useCallback(() => {
    setSelectedDate("");
    setSelectedEndDate("");
    setDraftDate("");
    setDraftEndDate("");
    setDateError("");
    setCurrentPage(1);
    scrollTop();
  }, [scrollTop]);

  const commitDateRange = useCallback(
    (startDMY, endDMY) => {
      const startTrim = String(startDMY || "").trim();
      const endTrim = String(endDMY || "").trim();

      if (!startTrim && !endTrim) {
        setSelectedDate("");
        setSelectedEndDate("");
        setDraftDate("");
        setDraftEndDate("");
        setDateError("");
        setCurrentPage(1);
        closeDesktopPop();
        setMobilePanel(null);
        scrollTop();
        return;
      }

      if (!startTrim && endTrim) {
        setDateError("Vui lòng nhập Ngày đi trước khi nhập Ngày về.");
        return;
      }

      const startYMD = startTrim ? dmyToYMD(startTrim) : "";
      if (startTrim && !startYMD) {
        setDateError("Ngày đi không hợp lệ. Vui lòng nhập đúng dd/mm/yyyy.");
        return;
      }

      const finalStart =
        startYMD && compareYMD(startYMD, minDate) < 0 ? minDate : startYMD;

      let endYMD = endTrim ? dmyToYMD(endTrim) : "";
      if (endTrim && !endYMD) {
        setDateError("Ngày về không hợp lệ. Vui lòng nhập đúng dd/mm/yyyy.");
        return;
      }

      if (endYMD && finalStart && compareYMD(endYMD, finalStart) < 0) {
        setDateError("Ngày về phải lớn hơn hoặc bằng Ngày đi.");
        return;
      }

      setSelectedDate(finalStart || "");
      setSelectedEndDate(endYMD || "");
      setDraftDate(finalStart ? ymdToDMY(finalStart) : "");
      setDraftEndDate(endYMD ? ymdToDMY(endYMD) : "");
      setDateError("");

      if (finalStart) {
        const dt = new Date(finalStart);
        setCalMonth(new Date(dt.getFullYear(), dt.getMonth(), 1));
      }

      setCurrentPage(1);
      closeDesktopPop();
      setMobilePanel(null);
      scrollTop();
    },
    [minDate, scrollTop],
  );

  const onCalendarPick = useCallback(
    ({ startYMD, endYMD }) => {
      const finalStart =
        startYMD && compareYMD(startYMD, minDate) < 0 ? minDate : startYMD;
      const finalEnd =
        endYMD && finalStart && compareYMD(endYMD, finalStart) < 0 ? "" : endYMD;

      setDraftDate(finalStart ? ymdToDMY(finalStart) : "");
      setDraftEndDate(finalEnd ? ymdToDMY(finalEnd) : "");
      setDateError("");
    },
    [minDate],
  );

  useEffect(() => {
    document.body.style.overflow = mobilePanel ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobilePanel]);

  const mapSort = useCallback(() => {
    switch (sortOrder) {
      case "recent":
        return "startDate,asc";
      case "discount":
        return "percentDiscount,desc";
      case "asc":
        return "priceAdult,asc";
      case "desc":
        return "priceAdult,desc";
      default:
        return "startDate,asc";
    }
  }, [sortOrder]);

  const toTourModelList = (rawList) => {
    return rawList.map(
      (t) =>
        new Tour(
          t.tourId,
          t.title,
          t.priceAdult,
          t.mainImage,
          t.description,
          t.startDate,
          t.endDate,
          t.destination,
          t.percentDiscount,
          t.limitSeats,
          t._links?.images?.href || null,
          t.durationDays,
        ),
    );
  };

  const fetchTours = useCallback(async () => {
    setIsLoading(true);
    setTours([]);

    try {
      const startDateQuery = selectedDate || minDate;
      const keyword = debouncedSearchTerm.trim();

      const data = await filterTours({
        keyword,
        startDate: startDateQuery,
        endDate: selectedEndDate || "",
        durationDay: selectedDuration || "",
        departureLocation: selectedLocation || "",
        status: "Activated",
        page: currentPage - 1,
        size: pageSize,
        sort: mapSort(),
      });

      const rawList = data?._embedded?.tours ?? [];
      setTours(toTourModelList(rawList));
      setTotalPages(Math.max(1, data?.page?.totalPages || 1));
    } catch (error) {
      console.error("Fetch tours error:", error);
      setTours([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedDate,
    selectedEndDate,
    selectedDuration,
    selectedLocation,
    minDate,
    pageSize,
    mapSort,
  ]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const getVisiblePages = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    if (currentPage === 1) return [1, 2, 3];
    if (currentPage === 2) return [1, 2, 3, 4];
    if (currentPage === 3) return [1, 2, 3, 4, 5];

    if (currentPage === totalPages)
      return [totalPages - 2, totalPages - 1, totalPages];
    if (currentPage === totalPages - 1)
      return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    if (currentPage === totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    let start = currentPage - 2;
    let end = currentPage + 2;
    if (start < 1) start = 1;
    if (end > totalPages) end = totalPages;
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const clearAllFilters = () => {
    setSelectedLocation("");
    setSelectedDuration("");
    setSelectedDate("");
    setSelectedEndDate("");
    setDraftDate("");
    setDraftEndDate("");
    setDateError("");

    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDraftSearch("");

    setDraftLocation("");
    setDraftDuration("");

    setCurrentPage(1);
    closeDesktopPop();
    setMobilePanel(null);

    nav("/tours", { replace: true, state: null });
    scrollTop();
  };

  const filterCount =
    (selectedLocation ? 1 : 0) +
    (selectedDuration ? 1 : 0) +
    (selectedDate ? 1 : 0) +
    (selectedEndDate ? 1 : 0) +
    (debouncedSearchTerm.trim() ? 1 : 0);

  const dateLabel = selectedDate
    ? selectedEndDate
      ? `${ymdToDMY(selectedDate)} - ${ymdToDMY(selectedEndDate)}`
      : ymdToDMY(selectedDate)
    : "Date";

  return (
    <div className="bg-gray-50 py-10 sm:py-12 flex flex-col items-center min-h-screen">
      {/* ✅ route change scroll */}
      <ScrollToTop />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-30">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-800">
            Tour Packages
          </h2>

          {filterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="hidden sm:inline-flex px-3 py-2 rounded-full bg-orange-100 text-orange-700 text-sm hover:bg-orange-200"
            >
              Clear filters ({filterCount})
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 sm:mb-10 relative z-40">
          <div className="flex items-center w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Search..."
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearchDraft();
              }}
              className="flex-1 text-sm outline-none bg-transparent"
            />
            <button type="button" onClick={applySearchDraft} className="p-1">
              <FaSearch size={16} className="text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => {
                setDraftDate(selectedDate ? ymdToDMY(selectedDate) : "");
                setDraftEndDate(selectedEndDate ? ymdToDMY(selectedEndDate) : "");
                setDateError("");
                const base = selectedDate || minDate;
                const dt = new Date(base);
                setCalMonth(new Date(dt.getFullYear(), dt.getMonth(), 1));
                setMobilePanel("date");
              }}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2"
            >
              <FaCalendarAlt />
              <span className="text-sm">{dateLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDraftLocation(selectedLocation);
                setDraftDuration(selectedDuration);
                setMobilePanel("filter");
              }}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 relative"
            >
              <FaFilter />
              <span className="text-sm">Filter</span>
              {filterCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-orange-500 text-white grid place-items-center">
                  {filterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobilePanel("sort")}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2"
            >
              {sortOrder === "asc" ? <FaSortAmountUpAlt /> : <FaSortAmountDownAlt />}
              <span className="text-sm">Sort</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center justify-end gap-2">
            {/* Date picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDraftDate(selectedDate ? ymdToDMY(selectedDate) : "");
                  setDraftEndDate(selectedEndDate ? ymdToDMY(selectedEndDate) : "");
                  setDateError("");
                  const base = selectedDate || minDate;
                  const dt = new Date(base);
                  setCalMonth(new Date(dt.getFullYear(), dt.getMonth(), 1));

                  setShowDatePicker((v) => !v);
                  setShowFilter(false);
                  setShowSort(false);
                }}
                className="bg-white border border-gray-300 rounded-xl px-3 h-10 flex items-center gap-2 hover:bg-orange-50"
              >
                <FaCalendarAlt size={16} />
                <span className="text-sm">{dateLabel}</span>
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-[420px] bg-white border rounded-2xl shadow-lg p-4 z-50">
                  <p className="font-semibold mb-2">Date range</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        Start (dd/mm/yyyy)
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/yyyy"
                        value={draftDate}
                        onChange={(e) => {
                          setDraftDate(formatDMYInput(e.target.value));
                          setDateError("");
                        }}
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        End (dd/mm/yyyy)
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/yyyy"
                        value={draftEndDate}
                        onChange={(e) => {
                          setDraftEndDate(formatDMYInput(e.target.value));
                          setDateError("");
                        }}
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {dateError && (
                    <div className="text-sm text-red-600 mt-2">{dateError}</div>
                  )}

                  <div className="mt-4">
                    <CalendarRangePicker
                      month={calMonth}
                      onMonthChange={setCalMonth}
                      minYMD={minDate}
                      startYMD={dmyToYMD(draftDate) || ""}
                      endYMD={dmyToYMD(draftEndDate) || ""}
                      onPick={onCalendarPick}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => commitDateRange(draftDate, draftEndDate)}
                      className="py-2 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearDateOnly();
                        setShowDatePicker(false);
                      }}
                      className="py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDraftLocation(selectedLocation);
                  setDraftDuration(selectedDuration);
                  setShowFilter((v) => !v);
                  setShowSort(false);
                  setShowDatePicker(false);
                }}
                className="bg-white border border-gray-300 rounded-xl w-10 h-10 flex items-center justify-center hover:bg-orange-50 relative"
              >
                <FaFilter size={16} />
                {filterCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-orange-500 text-white grid place-items-center">
                    {filterCount}
                  </span>
                )}
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-2xl shadow-lg p-4 z-50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-semibold mb-2">Location</p>
                      <div className="max-h-48 overflow-auto pr-1">
                        {locations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                              draftLocation === loc ? "bg-orange-200" : ""
                            }`}
                            onClick={() => setDraftLocation(loc)}
                          >
                            {loc === "" ? "All" : loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Duration</p>
                      <div className="max-h-48 overflow-auto pr-1">
                        {durations.map((d) => (
                          <button
                            key={String(d)}
                            type="button"
                            className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                              String(draftDuration) === String(d)
                                ? "bg-orange-200"
                                : ""
                            }`}
                            onClick={() => setDraftDuration(d)}
                          >
                            {d === "" ? "All" : `${d} days`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      type="button"
                      onClick={applyFilterDraft}
                      className="py-2 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={clearFilterDraft}
                      className="py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold"
                    >
                      Clear
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full mt-3 py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSort((v) => !v);
                  setShowFilter(false);
                  setShowDatePicker(false);
                }}
                className="bg-white border border-gray-300 rounded-xl w-10 h-10 flex items-center justify-center hover:bg-orange-50"
              >
                {sortOrder === "asc" ? (
                  <FaSortAmountUpAlt size={16} />
                ) : (
                  <FaSortAmountDownAlt size={16} />
                )}
              </button>

              {showSort && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-2xl shadow-lg p-3 z-50">
                  <p className="font-semibold mb-2">Sort by</p>
                  {[
                    ["recent", "Nearest Start Date"],
                    ["discount", "Biggest Discount"],
                    ["asc", "Low → High"],
                    ["desc", "High → Low"],
                  ].map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                        sortOrder === k ? "bg-orange-200" : ""
                      }`}
                      onClick={() => {
                        setSortOrder(k);
                        setCurrentPage(1);
                        setShowSort(false);
                        scrollTop();
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-500 text-lg">
            Loading tours...
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-xl font-semibold text-gray-800 mb-2">
              Không có tour phù hợp
            </div>
            <div className="text-gray-500">
              Thử đổi ngày khởi hành, điểm đi hoặc số ngày để tìm thêm tour nha.
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-5 inline-flex px-4 py-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch relative z-10">
            {tours.map((t) => (
              <TourCard key={t.id || t.tourId || t.tourID} tour={t} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(p) => {
              setCurrentPage(p);
              scrollTop();
            }}
            visiblePages={getVisiblePages()}
          />
        )}

        <BookingVideo />
      </div>

      {mobilePanel && (
        <div className="fixed inset-0 z-[80] sm:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobilePanel(null)}
          />
          <div className="absolute inset-x-0 bottom-0 top-16 bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-semibold text-lg">
                {mobilePanel === "date"
                  ? "Date"
                  : mobilePanel === "filter"
                    ? "Filter"
                    : "Sort"}
              </div>
              <button
                type="button"
                onClick={() => setMobilePanel(null)}
                className="px-3 py-1.5 rounded-full bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              {mobilePanel === "date" && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Date range (dd/mm/yyyy)
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Start</div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/yyyy"
                        value={draftDate}
                        onChange={(e) => {
                          setDraftDate(formatDMYInput(e.target.value));
                          setDateError("");
                        }}
                        className="w-full border rounded-2xl px-4 py-3 text-sm"
                      />
                    </div>

                    <div>
                      <div className="text-xs text-gray-600 mb-1">End</div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/yyyy"
                        value={draftEndDate}
                        onChange={(e) => {
                          setDraftEndDate(formatDMYInput(e.target.value));
                          setDateError("");
                        }}
                        className="w-full border rounded-2xl px-4 py-3 text-sm"
                      />
                    </div>
                  </div>

                  {dateError && (
                    <div className="text-sm text-red-600">{dateError}</div>
                  )}

                  <div className="pt-2">
                    <CalendarRangePicker
                      month={calMonth}
                      onMonthChange={setCalMonth}
                      minYMD={minDate}
                      startYMD={dmyToYMD(draftDate) || ""}
                      endYMD={dmyToYMD(draftEndDate) || ""}
                      onPick={onCalendarPick}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => commitDateRange(draftDate, draftEndDate)}
                      className="py-3 rounded-2xl bg-orange-500 text-white font-semibold"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearDateOnly();
                        setMobilePanel(null);
                      }}
                      className="py-3 rounded-2xl bg-gray-200 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {mobilePanel === "filter" && (
                <div className="space-y-5">
                  <div>
                    <div className="font-semibold mb-2">Location</div>
                    <div className="grid grid-cols-2 gap-2">
                      {locations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setDraftLocation(loc)}
                          className={`py-3 px-2 rounded-2xl border text-sm ${
                            draftLocation === loc
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white"
                          }`}
                        >
                          {loc === "" ? "All" : loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold mb-2">Duration</div>
                    <div className="grid grid-cols-3 gap-2">
                      {durations.map((d) => (
                        <button
                          key={String(d)}
                          type="button"
                          onClick={() => setDraftDuration(d)}
                          className={`py-3 rounded-2xl border text-sm ${
                            String(draftDuration) === String(d)
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white"
                          }`}
                        >
                          {d === "" ? "All" : `${d}d`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        applyFilterDraft();
                      }}
                      className="py-3 rounded-2xl bg-orange-500 text-white font-semibold"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={clearFilterDraft}
                      className="py-3 rounded-2xl bg-gray-200 font-semibold"
                    >
                      Clear
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      clearAllFilters();
                      setMobilePanel(null);
                    }}
                    className="w-full py-3 rounded-2xl bg-gray-100 font-semibold"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {mobilePanel === "sort" && (
                <div className="space-y-2">
                  {[
                    ["recent", "Nearest Start Date"],
                    ["discount", "Biggest Discount"],
                    ["asc", "Low → High"],
                    ["desc", "High → Low"],
                  ].map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setSortOrder(k);
                        setCurrentPage(1);
                        setMobilePanel(null);
                        scrollTop();
                      }}
                      className={`w-full text-left px-4 py-4 rounded-2xl border ${
                        sortOrder === k
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
