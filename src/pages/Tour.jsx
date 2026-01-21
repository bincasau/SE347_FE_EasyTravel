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
  FaRegClock,
} from "react-icons/fa";

import { filterTours, getDepartureLocations, getAllTours } from "../apis/Tour";
import TourCard from "../components/pages/Tour/TourCard";
import Pagination from "../utils/Pagination";
import BookingVideo from "../components/pages/Tour/Video";
import CalendarRangePicker from "../components/pages/Tour/CalendarRangePicker";
import Tour from "../models/Tour";
import { useLang } from "../contexts/LangContext";
import ScrollToTop from "../utils/ScrollToTop";
import {
  toYMDFromDateObj,
  ymdToDMY,
  dmyToYMD,
  formatDMYInput,
  compareYMD,
} from "../utils/tourUtils";

export default function TourPage() {
  const location = useLocation();
  const nav = useNavigate();
  const { t } = useLang();

  // ✅ state change scroll
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
  const [destinations, setDestinations] = useState([""]);
  const [durations, setDurations] = useState([""]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [draftSearch, setDraftSearch] = useState("");

  const [sortOrder, setSortOrder] = useState("recent");

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState(""); // UI only

  const [draftDate, setDraftDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  const [dateError, setDateError] = useState("");

  const [draftLocation, setDraftLocation] = useState("");
  const [draftDestination, setDraftDestination] = useState("");
  const [draftDuration, setDraftDuration] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDurationPop, setShowDurationPop] = useState(false);

  const [mobilePanel, setMobilePanel] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 8;

  const [calMonth, setCalMonth] = useState(() => {
    const dt = new Date(minDate);
    return new Date(dt.getFullYear(), dt.getMonth(), 1);
  });

  const lastHeroKeyRef = useRef("");
  const reqIdRef = useRef(0);

  // ✅ apply from Hero state
  useEffect(() => {
    const s = location.state;
    if (!s) return;

    const heroStart = s.startDate || "";
    const heroEnd = s.endDate || "";
    const heroLocRaw = s.departureLocation ?? s.departure ?? "";
    const heroDurRaw = s.durationDay ?? s.durationDays ?? "";
    const heroDesRaw = s.destination ?? s.dest ?? "";

    const heroLoc = heroLocRaw ? String(heroLocRaw) : "";
    const heroDur =
      heroDurRaw !== undefined && heroDurRaw !== null && heroDurRaw !== ""
        ? String(heroDurRaw)
        : "";
    const heroDes = heroDesRaw ? String(heroDesRaw) : "";

    const heroKey = JSON.stringify({
      heroStart,
      heroEnd,
      heroLoc,
      heroDur,
      heroDes,
    });
    if (lastHeroKeyRef.current === heroKey) return;
    lastHeroKeyRef.current = heroKey;

    setCurrentPage(1);

    if (heroStart) {
      const finalStart =
        compareYMD(heroStart, minDate) < 0 ? minDate : heroStart;
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

    setSelectedDestination(heroDes);
    setDraftDestination(heroDes);

    setSelectedDuration(heroDur);
    setDraftDuration(heroDur);

    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDraftSearch("");

    scrollTop();
  }, [location.state, minDate, scrollTop]);

  // ✅ Load locations + durations + destinations from DB
  useEffect(() => {
    const loadMeta = async () => {
      // 1) departure locations
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

      // 2) durations + destinations from all tours
      try {
        const all = await getAllTours();
        const arr = Array.isArray(all) ? all : [];

        // durations
        const durs = arr
          .map((t) => t?.durationDays ?? t?.durationDay ?? "")
          .map((x) => String(x ?? "").trim())
          .filter((x) => x !== "" && !Number.isNaN(Number(x)))
          .map((x) => Number(x));
        const uniqueDurs = Array.from(new Set(durs)).sort((a, b) => a - b);
        setDurations(["", ...uniqueDurs]);

        // destinations
        const dests = arr
          .map((t) => String(t?.destination ?? "").trim())
          .filter(Boolean);
        const uniqueDests = Array.from(new Set(dests)).sort((a, b) =>
          a.localeCompare(b, "vi")
        );
        setDestinations(["", ...uniqueDests]);
      } catch (e) {
        console.error("Load durations/destinations error:", e);
        setDurations(["", 2, 3, 4, 5, 7, 10]);
        setDestinations([""]);
      }
    };

    loadMeta();
  }, []);

  // debounce search
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
    setShowDurationPop(false);
  };

  const applyFilterDraft = useCallback(() => {
    setSelectedLocation(draftLocation);
    setSelectedDestination(draftDestination);

    setCurrentPage(1);
    setShowFilter(false);
    setMobilePanel(null);
    scrollTop();
  }, [draftLocation, draftDestination, scrollTop]);

  const clearFilterDraft = useCallback(() => {
    setDraftLocation("");
    setDraftDestination("");
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
    [minDate, scrollTop]
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
    [minDate]
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

  const toTourModelList = useCallback((rawList) => {
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
          t.durationDays
        )
    );
  }, []);

  const fetchTours = useCallback(async () => {
    const reqId = ++reqIdRef.current;
    setIsLoading(true);
    setTours([]);

    try {
      const startDateQuery = selectedDate || minDate;
      const keyword = debouncedSearchTerm.trim();

      const data = await filterTours({
        keyword,
        startDate: startDateQuery,
        durationDay: selectedDuration || "",
        departureLocation: selectedLocation || "",
        status: "Activated",
        page: currentPage - 1,
        size: pageSize,
        sort: mapSort(),
      });

      if (reqId !== reqIdRef.current) return;

      let rawList = data?._embedded?.tours ?? [];

      if (selectedDestination) {
        const desLower = String(selectedDestination).trim().toLowerCase();
        rawList = rawList.filter((t) =>
          String(t?.destination ?? "")
            .trim()
            .toLowerCase()
            .includes(desLower)
        );
      }

      setTours(toTourModelList(rawList));
      setTotalPages(Math.max(1, data?.page?.totalPages || 1));
    } catch (error) {
      if (reqId !== reqIdRef.current) return;
      console.error("Fetch tours error:", error);
      setTours([]);
      setTotalPages(1);
    } finally {
      if (reqId === reqIdRef.current) setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedDate,
    selectedDuration,
    selectedLocation,
    selectedDestination,
    minDate,
    pageSize,
    mapSort,
    toTourModelList,
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
    setSelectedDestination("");
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
    setDraftDestination("");
    setDraftDuration("");

    setCurrentPage(1);
    closeDesktopPop();
    setMobilePanel(null);

    nav("/tours", { replace: true, state: null });
    scrollTop();
  };

  const filterCount =
    (selectedLocation ? 1 : 0) +
    (selectedDestination ? 1 : 0) +
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
      <ScrollToTop />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-30">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-800">
            {t("tourPage.title")}
          </h2>

          {filterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="hidden sm:inline-flex px-3 py-2 rounded-full bg-orange-100 text-orange-700 text-sm hover:bg-orange-200"
            >
              {t("tourPage.clearFilters")} ({filterCount})
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 sm:mb-10 relative z-40">
          <div className="flex items-center w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm">
            <input
              type="text"
              placeholder={t("tourPage.search")}
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

          {/* Mobile quick buttons (Date icon-only + badge) */}
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
              title={dateLabel}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center relative hover:bg-orange-50"
            >
              <FaCalendarAlt />
              {(selectedDate || selectedEndDate) && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-orange-500 text-white grid place-items-center">
                  ✓
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setDraftLocation(selectedLocation);
                setDraftDestination(selectedDestination);
                setDraftDuration(selectedDuration);
                setMobilePanel("filter");
              }}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 relative"
            >
              <FaFilter />
              <span className="text-sm">{t("tourPage.filter")}</span>
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
              <span className="text-sm">{t("tourPage.sort")}</span>
            </button>
          </div>

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center justify-end gap-2">
            {/* Date picker (ICON ONLY) */}
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
                  setShowDurationPop(false);
                }}
                title={dateLabel}
                className="bg-white border border-gray-300 rounded-xl w-10 h-10 flex items-center justify-center hover:bg-orange-50 relative"
              >
                <FaCalendarAlt size={16} />
                {(selectedDate || selectedEndDate) && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-orange-500 text-white grid place-items-center">
                    ✓
                  </span>
                )}
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-[420px] bg-white border rounded-2xl shadow-lg p-4 z-50">
                  <p className="font-semibold mb-2">Date range</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        {t("tourPage.dayStart")} (dd/mm/yyyy)
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
                        {t("tourPage.dayEnd")} (dd/mm/yyyy)
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
                      t={t}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => commitDateRange(draftDate, draftEndDate)}
                      className="py-2 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold"
                    >
                      {t("tourPage.apply")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearDateOnly();
                        setShowDatePicker(false);
                      }}
                      className="py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold"
                    >
                      {t("tourPage.clear")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter (Departure + Destination ONLY) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDraftLocation(selectedLocation);
                  setDraftDestination(selectedDestination);
                  setShowFilter((v) => !v);
                  setShowSort(false);
                  setShowDatePicker(false);
                  setShowDurationPop(false);
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
                <div className="absolute right-0 mt-2 w-[760px] max-w-[90vw] bg-white border rounded-2xl shadow-lg p-4 z-50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-semibold mb-2">{t("tourPage.departure")}</p>
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
                            {loc === "" ? t("tourPage.departure") : loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">{t("tourPage.destination")}</p>
                      <div className="max-h-48 overflow-auto pr-1">
                        {destinations.map((des) => (
                          <button
                            key={des}
                            type="button"
                            className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                              draftDestination === des ? "bg-orange-200" : ""
                            }`}
                            onClick={() => setDraftDestination(des)}
                          >
                            {des === "" ? t("tourPage.destination") : des}
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
                      {t("tourPage.apply")}
                    </button>
                    <button
                      type="button"
                      onClick={clearFilterDraft}
                      className="py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold"
                    >
                      {t("tourPage.clear")}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full mt-3 py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300"
                  >
                    {t("tourPage.clearAll")}
                  </button>
                </div>
              )}
            </div>

            {/* Duration dropdown (ICON ONLY) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowDurationPop((v) => !v);
                  setShowFilter(false);
                  setShowSort(false);
                  setShowDatePicker(false);
                }}
                title={
                  selectedDuration ? `${t("tourPage.duration")}: ${selectedDuration} ${t("tourPage.durationDays")}` : t("tourPage.duration")
                }
                className="bg-white border border-gray-300 rounded-xl w-10 h-10 flex items-center justify-center hover:bg-orange-50 relative"
              >
                <FaRegClock size={16} />
                {selectedDuration && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-orange-500 text-white grid place-items-center">
                    {String(selectedDuration)}
                  </span>
                )}
              </button>

              {showDurationPop && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-2xl shadow-lg p-3 z-50">
                  <p className="font-semibold mb-2">{t("tourPage.duration")}</p>
                  <div className="max-h-64 overflow-auto pr-1">
                    {durations.map((d) => (
                      <button
                        key={String(d)}
                        type="button"
                        className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                          String(selectedDuration) === String(d)
                            ? "bg-orange-200"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedDuration(d);
                          setDraftDuration(d);
                          setCurrentPage(1);
                          setShowDurationPop(false);
                          scrollTop();
                        }}
                      >
                        {d === "" ? t("tourPage.duration") : `${d} ${t("tourPage.durationDays")}`}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDuration("");
                      setDraftDuration("");
                      setCurrentPage(1);
                      setShowDurationPop(false);
                      scrollTop();
                    }}
                    className="w-full mt-2 py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold"
                  >
                    {t("tourPage.clearDuration")}
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
                  setShowDurationPop(false);
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
                  <p className="font-semibold mb-2">{t("tourPage.sort")}</p>
                  {[
                    ["recent", t("tourPage.nearestStart")],
                    ["discount", t("tourPage.biggestDiscount")],
                    ["asc", t("tourPage.lowToHigh")],
                    ["desc", t("tourPage.highToLow")],
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
            {t("tourPage.loading")}
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-xl font-semibold text-gray-800 mb-2">
              {t("tourPage.noToursFound")}
            </div>
            <div className="text-gray-500">
              {t("tourPage.tryChanging")}
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-5 inline-flex px-4 py-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200"
            >
              {t("tourPage.clearAll")}
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

      {/* Mobile panels */}
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
                  ? t("tourPage.date")
                  : mobilePanel === "filter"
                  ? t("tourPage.filter")
                  : t("tourPage.sort")}
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
                    {t("tourPage.date")} (dd/mm/yyyy)
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">{t("tourPage.dayStart")}</div>
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
                      <div className="text-xs text-gray-600 mb-1">{t("tourPage.dayEnd")}</div>
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
                      t={t}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => commitDateRange(draftDate, draftEndDate)}
                      className="py-3 rounded-2xl bg-orange-500 text-white font-semibold"
                    >
                      {t("tourPage.apply")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearDateOnly();
                        setMobilePanel(null);
                      }}
                      className="py-3 rounded-2xl bg-gray-200 font-semibold"
                    >
                      {t("tourPage.clear")}
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile filter giữ nguyên (có cả Duration) */}
              {mobilePanel === "filter" && (
                <div className="space-y-5">
                  <div>
                    <div className="font-semibold mb-2">{t("tourPage.departure")}</div>
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
                          {loc === "" ? t("tourPage.departure") : loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold mb-2">{t("tourPage.destination")}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {destinations.map((des) => (
                        <button
                          key={des}
                          type="button"
                          onClick={() => setDraftDestination(des)}
                          className={`py-3 px-2 rounded-2xl border text-sm ${
                            draftDestination === des
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white"
                          }`}
                        >
                          {des === "" ? t("tourPage.destination") : des}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold mb-2">{t("tourPage.duration")}</div>
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
                          {d === "" ? t("tourPage.duration") : `${d}d`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation(draftLocation);
                        setSelectedDestination(draftDestination);
                        setSelectedDuration(draftDuration);
                        setCurrentPage(1);
                        setMobilePanel(null);
                        scrollTop();
                      }}
                      className="py-3 rounded-2xl bg-orange-500 text-white font-semibold"
                    >
                      {t("tourPage.apply")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftLocation("");
                        setDraftDestination("");
                        setDraftDuration("");
                      }}
                      className="py-3 rounded-2xl bg-gray-200 font-semibold"
                    >
                      {t("tourPage.clear")}
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
                    {t("tourPage.clearAll")}
                  </button>
                </div>
              )}

              {mobilePanel === "sort" && (
                <div className="space-y-2">
                  {[
                    ["recent", t("tourPage.nearestStart")],
                    ["discount", t("tourPage.biggestDiscount")],
                    ["asc", t("tourPage.lowToHigh")],
                    ["desc", t("tourPage.highToLow")],
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
