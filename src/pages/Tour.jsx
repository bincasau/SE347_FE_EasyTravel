// =====================================
// 📌 FILE: src/pages/TourPage.jsx
// ✅ FULL FILE - Apply-style filter (Traveloka-like)
// ✅ HeroSection -> /tours (state) => auto apply + auto fetch
// ✅ Filter/Date chọn nhiều -> bấm Apply mới fetch
// ✅ Loading: clear list để không hiện data cũ
// ✅ Empty state: "Không có tour phù hợp"
// ✅ Status luôn "Activated"
// ✅ Date input: dd/mm/yyyy (text input + validate + auto format)
// =====================================

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaFilter,
  FaSearch,
  FaSortAmountDownAlt,
  FaSortAmountUpAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import { filterTours, getDepartureLocations } from "../apis/Tour"; // ✅ chỉnh đúng path của bạn
import TourCard from "../components/pages/Tour/TourCard";
import Pagination from "../utils/Pagination";
import BookingVideo from "../components/pages/Tour/Video";
import Tour from "../models/Tour";

export default function TourPage() {
  const location = useLocation();
  const nav = useNavigate();
  const appliedHeroRef = useRef(false);

  const [tours, setTours] = useState([]);

  const [locations, setLocations] = useState([]);
  const [durations] = useState(["", 2, 3, 4, 5, 7, 10]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ committed search (dùng để debounce + fetch)
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // ✅ UI draft search (gõ xong Apply mới set searchTerm)
  const [draftSearch, setDraftSearch] = useState("");

  const [sortOrder, setSortOrder] = useState("recent");

  // ✅ committed filters (dùng để fetch)
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  // ✅ selectedDate: yyyy-mm-dd (committed để fetch)
  const [selectedDate, setSelectedDate] = useState("");

  // ✅ draftDate: dd/mm/yyyy (user nhập + Apply mới commit)
  const [draftDate, setDraftDate] = useState("");

  // ✅ show lỗi ngày
  const [dateError, setDateError] = useState("");

  // ✅ drafts for "Apply" UX (Filter)
  const [draftLocation, setDraftLocation] = useState("");
  const [draftDuration, setDraftDuration] = useState("");

  // desktop dropdown
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ✅ mobile overlay panel
  const [mobilePanel, setMobilePanel] = useState(null); // "date" | "filter" | "sort" | null

  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 8;

  // ===== helpers =====
  const toYMDFromDateObj = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getDefaultStartDatePlus2 = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return toYMDFromDateObj(d);
  };

  // ✅ minDate cố định theo "today + 2" (yyyy-mm-dd)
  const minDate = useMemo(() => getDefaultStartDatePlus2(), []);

  // yyyy-mm-dd -> dd/mm/yyyy
  const ymdToDMY = (ymd) => {
    if (!ymd) return "";
    const [y, m, d] = String(ymd).split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
  };

  // dd/mm/yyyy -> yyyy-mm-dd (return "" nếu invalid)
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

    // validate ngày thật bằng Date object
    const dt = new Date(yyyy, mm - 1, dd);
    if (
      dt.getFullYear() !== yyyy ||
      dt.getMonth() !== mm - 1 ||
      dt.getDate() !== dd
    )
      return "";

    return `${String(yyyy).padStart(4, "0")}-${String(mm).padStart(
      2,
      "0"
    )}-${String(dd).padStart(2, "0")}`;
  };

  // auto format: chỉ cho nhập số, tự chèn "/" theo dd/mm/yyyy
  const formatDMYInput = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8); // ddmmyyyy
    const d = digits.slice(0, 2);
    const m = digits.slice(2, 4);
    const y = digits.slice(4, 8);
    let out = d;
    if (digits.length >= 3) out += "/" + m;
    if (digits.length >= 5) out += "/" + y;
    return out;
  };

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

  const closeDesktopPop = () => {
    setShowFilter(false);
    setShowSort(false);
    setShowDatePicker(false);
  };

  const closeMobilePanel = () => setMobilePanel(null);

  // lock scroll on mobile panel
  useEffect(() => {
    document.body.style.overflow = mobilePanel ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobilePanel]);

  // load locations
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

  // debounce search (chỉ chạy khi searchTerm thay đổi)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ commit date: draftDate (dd/mm/yyyy) -> selectedDate (yyyy-mm-dd)
  const commitDate = useCallback(
    (draftDMY) => {
      const trimmed = String(draftDMY || "").trim();

      // empty => clear
      if (!trimmed) {
        setSelectedDate("");
        setDraftDate("");
        setDateError("");
        setCurrentPage(1);
        closeDesktopPop();
        closeMobilePanel();
        return;
      }

      const ymd = dmyToYMD(trimmed);
      if (!ymd) {
        setDateError("Ngày không hợp lệ. Vui lòng nhập đúng dd/mm/yyyy.");
        return;
      }

      // clamp >= minDate
      const finalYMD = ymd < minDate ? minDate : ymd;

      setSelectedDate(finalYMD);
      setDraftDate(ymdToDMY(finalYMD));
      setDateError("");

      setCurrentPage(1);
      closeDesktopPop();
      closeMobilePanel();
    },
    [minDate]
  );

  const clearDateOnly = useCallback(() => {
    setSelectedDate("");
    setDraftDate("");
    setDateError("");
    setCurrentPage(1);
  }, []);

  const applyFilterDraft = useCallback(() => {
    setSelectedLocation(draftLocation);
    setSelectedDuration(draftDuration);
    setCurrentPage(1);
    setShowFilter(false);
    closeMobilePanel();
  }, [draftLocation, draftDuration]);

  const clearFilterDraft = useCallback(() => {
    setDraftLocation("");
    setDraftDuration("");
  }, []);

  const applySearchDraft = useCallback(() => {
    setSearchTerm(draftSearch);
    setCurrentPage(1);
  }, [draftSearch]);

  // ==========================================
  // ✅ APPLY FILTER TỪ HERO SECTION (/ -> /tours)
  // ==========================================
  useEffect(() => {
    const s = location.state;
    if (!s || appliedHeroRef.current) return;

    appliedHeroRef.current = true;

    setCurrentPage(1);

    // ✅ startDate from hero is yyyy-mm-dd
    if (s.startDate) {
      const finalDate = s.startDate < minDate ? minDate : s.startDate;
      setSelectedDate(finalDate);
      setDraftDate(ymdToDMY(finalDate));
      setDateError("");
    } else {
      setSelectedDate("");
      setDraftDate("");
      setDateError("");
    }

    // ✅ departureLocation -> location
    const heroLoc = s.departureLocation ? String(s.departureLocation) : "";
    setSelectedLocation(heroLoc);
    setDraftLocation(heroLoc);

    // ✅ durationDay
    const heroDur =
      s.durationDay !== undefined &&
      s.durationDay !== null &&
      s.durationDay !== ""
        ? String(s.durationDay)
        : "";
    setSelectedDuration(heroDur);
    setDraftDuration(heroDur);

    // ✅ clear search when coming from hero
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDraftSearch("");

    // ✅ clear state để refresh không apply lại
    nav(location.pathname, { replace: true, state: null });
  }, [location.state, minDate, nav, location.pathname]);

  // ✅ helper map BE -> Tour model
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
          t.durationDays
        )
    );
  };

  // ✅ MAIN FETCH: dùng 1 endpoint filterTours()
  const fetchTours = useCallback(async () => {
    setIsLoading(true);
    setTours([]);

    try {
      const startDateQuery = selectedDate || minDate; // default today+2
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

      const rawList = data?._embedded?.tours ?? [];
      const result = toTourModelList(rawList);

      setTours(result);
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
    setDraftDate("");
    setDateError("");

    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDraftSearch("");

    setDraftLocation("");
    setDraftDuration("");

    setCurrentPage(1);
    closeDesktopPop();
    closeMobilePanel();
  };

  const filterCount =
    (selectedLocation ? 1 : 0) +
    (selectedDuration ? 1 : 0) +
    (selectedDate ? 1 : 0) +
    (debouncedSearchTerm.trim() ? 1 : 0);

  return (
    <div className="bg-gray-50 py-10 sm:py-12 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-30">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-3xl sm:text-4xl font-podcast text-gray-800">
            Tour Packages
          </h2>

          {filterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="hidden sm:inline-flex px-3 py-2 rounded-full bg-orange-100 text-orange-700 text-sm hover:bg-orange-200"
            >
              Clear filters ({filterCount})
            </button>
          )}
        </div>

        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 sm:mb-10 relative z-40">
          {/* SEARCH (draft -> apply) */}
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

          {/* MOBILE: 3 buttons */}
          <div className="grid grid-cols-3 gap-2 sm:hidden">
            <button
              onClick={() => {
                setDraftDate(selectedDate ? ymdToDMY(selectedDate) : "");
                setDateError("");
                setMobilePanel("date");
              }}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2"
            >
              <FaCalendarAlt />
              <span className="text-sm">
                {selectedDate ? ymdToDMY(selectedDate) : "Date"}
              </span>
            </button>

            <button
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
              onClick={() => setMobilePanel("sort")}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2"
            >
              {sortOrder === "asc" ? (
                <FaSortAmountUpAlt />
              ) : (
                <FaSortAmountDownAlt />
              )}
              <span className="text-sm">Sort</span>
            </button>
          </div>

          {/* DESKTOP: icon dropdown */}
          <div className="hidden sm:flex items-center justify-end gap-2">
            {/* DATE */}
            <div className="relative">
              <button
                onClick={() => {
                  setDraftDate(selectedDate ? ymdToDMY(selectedDate) : "");
                  setDateError("");
                  setShowDatePicker((v) => !v);
                  setShowFilter(false);
                  setShowSort(false);
                }}
                className="bg-white border border-gray-300 rounded-xl px-3 h-10 flex items-center gap-2 hover:bg-orange-50"
              >
                <FaCalendarAlt size={16} />
                <span className="text-sm">
                  {selectedDate ? ymdToDMY(selectedDate) : "Date"}
                </span>
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-2xl shadow-lg p-4 z-50">
                  <p className="font-semibold mb-2">Start date (dd/mm/yyyy)</p>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    value={draftDate}
                    onChange={(e) => {
                      setDraftDate(formatDMYInput(e.target.value));
                      setDateError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitDate(draftDate);
                    }}
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                  />

                  <div className="text-xs text-gray-500 mt-2">
                    Min: <span className="font-semibold">{ymdToDMY(minDate)}</span>
                  </div>

                  {dateError && (
                    <div className="text-sm text-red-600 mt-2">{dateError}</div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={() => commitDate(draftDate)}
                      className="py-2 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold"
                    >
                      Apply
                    </button>
                    <button
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

            {/* FILTER */}
            <div className="relative">
              <button
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
                      onClick={applyFilterDraft}
                      className="py-2 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold"
                    >
                      Apply
                    </button>
                    <button
                      onClick={clearFilterDraft}
                      className="py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold"
                    >
                      Clear
                    </button>
                  </div>

                  <button
                    onClick={clearAllFilters}
                    className="w-full mt-3 py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* SORT */}
            <div className="relative">
              <button
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
                      className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                        sortOrder === k ? "bg-orange-200" : ""
                      }`}
                      onClick={() => {
                        setSortOrder(k);
                        setCurrentPage(1);
                        setShowSort(false);
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

        {/* LIST / EMPTY / LOADING */}
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
            onPageChange={setCurrentPage}
            visiblePages={getVisiblePages()}
          />
        )}

        <BookingVideo />
      </div>

      {/* ✅ MOBILE FULLSCREEN PANEL */}
      {mobilePanel && (
        <div className="fixed inset-0 z-[80] sm:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeMobilePanel}
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
                onClick={closeMobilePanel}
                className="px-3 py-1.5 rounded-full bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              {/* DATE */}
              {mobilePanel === "date" && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Start date (dd/mm/yyyy)
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitDate(draftDate);
                    }}
                    className="w-full border rounded-2xl px-4 py-3 text-sm"
                  />

                  <div className="text-xs text-gray-500">
                    Min: <span className="font-semibold">{ymdToDMY(minDate)}</span>
                  </div>

                  {dateError && (
                    <div className="text-sm text-red-600">{dateError}</div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => commitDate(draftDate)}
                      className="py-3 rounded-2xl bg-orange-500 text-white font-semibold"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        clearDateOnly();
                        closeMobilePanel();
                      }}
                      className="py-3 rounded-2xl bg-gray-200 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* FILTER */}
              {mobilePanel === "filter" && (
                <div className="space-y-5">
                  <div>
                    <div className="font-semibold mb-2">Location</div>
                    <div className="grid grid-cols-2 gap-2">
                      {locations.map((loc) => (
                        <button
                          key={loc}
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
                      onClick={applyFilterDraft}
                      className="py-3 rounded-2xl bg-orange-500 text-white font-semibold"
                    >
                      Apply
                    </button>
                    <button
                      onClick={clearFilterDraft}
                      className="py-3 rounded-2xl bg-gray-200 font-semibold"
                    >
                      Clear
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      clearAllFilters();
                      closeMobilePanel();
                    }}
                    className="w-full py-3 rounded-2xl bg-gray-100 font-semibold"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* SORT */}
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
                      onClick={() => {
                        setSortOrder(k);
                        setCurrentPage(1);
                        closeMobilePanel();
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
