import React, { useEffect, useState, useCallback } from "react";
import {
  FaFilter,
  FaSearch,
  FaSortAmountDownAlt,
  FaSortAmountUpAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  searchByTitle,
  searchByLocation,
  searchByDuration,
  searchByStartDate,
  getTours,
  getDepartureLocations,
} from "../apis/Tour";

import TourCard from "../components/pages/Tour/TourCard";
import Pagination from "../utils/Pagination";
import BookingVideo from "../components/pages/Tour/Video";
import Tour from "../models/Tour";

export default function TourPage() {
  const [tours, setTours] = useState([]);

  const [locations, setLocations] = useState([]);
  const [durations] = useState(["", 2, 3, 4, 5, 7, 10]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [sortOrder, setSortOrder] = useState("recent");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // desktop dropdown
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ✅ mobile overlay panel
  const [mobilePanel, setMobilePanel] = useState(null); // "date" | "filter" | "sort" | null

  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 8;

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

  const mapSort = () => {
    switch (sortOrder) {
      case "recent":
        return "recent";
      case "discount":
        return "percentDiscount,desc";
      case "asc":
        return "priceAdult";
      case "desc":
        return "priceAdult,desc";
      default:
        return "recent";
    }
  };

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

  const fetchTours = useCallback(async () => {
    setIsLoading(true);

    try {
      let data;
      let isSearchEndpoint = false;
      let sortDateMode = false;

      if (debouncedSearchTerm.trim()) {
        data = await searchByTitle(debouncedSearchTerm);
        isSearchEndpoint = true;
      } else if (selectedLocation) {
        data = await searchByLocation(selectedLocation);
        isSearchEndpoint = true;
      } else if (selectedDuration) {
        data = await searchByDuration(selectedDuration);
        isSearchEndpoint = true;
      } else if (selectedDate) {
        data = await searchByStartDate(selectedDate);
        isSearchEndpoint = true;
        sortDateMode = true;
      } else {
        data = await getTours(currentPage - 1, pageSize, mapSort());
        isSearchEndpoint = false;
      }

      const rawList = Array.isArray(data)
        ? data
        : data._embedded?.tours
        ? data._embedded.tours
        : [];

      let result = rawList.map(
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

      if (sortDateMode) {
        result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      }

      if (isSearchEndpoint) {
        const total = result.length;
        const pages = Math.ceil(total / pageSize);
        setTotalPages(pages);

        const startIndex = (currentPage - 1) * pageSize;
        result = result.slice(startIndex, startIndex + pageSize);
      } else {
        setTotalPages(data.page?.totalPages || 1);
      }

      setTours(result);
    } catch (error) {
      console.error("Fetch tours error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedLocation,
    selectedDuration,
    selectedDate,
    sortOrder,
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
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
    closeDesktopPop();
    closeMobilePanel();
  };

  const filterCount =
    (selectedLocation ? 1 : 0) + (selectedDuration ? 1 : 0) + (selectedDate ? 1 : 0);

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
          {/* SEARCH */}
          <div className="flex items-center w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
            />
            <FaSearch size={16} className="text-gray-600" />
          </div>

          {/* ✅ MOBILE: 3 nút full width */}
          <div className="grid grid-cols-3 gap-2 sm:hidden">
            <button
              onClick={() => setMobilePanel("date")}
              className="bg-white border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2"
            >
              <FaCalendarAlt />
              <span className="text-sm">Date</span>
            </button>
            <button
              onClick={() => setMobilePanel("filter")}
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
              {sortOrder === "asc" ? <FaSortAmountUpAlt /> : <FaSortAmountDownAlt />}
              <span className="text-sm">Sort</span>
            </button>
          </div>

          {/* DESKTOP: icon dropdown */}
          <div className="hidden sm:flex items-center justify-end gap-2">
            {/* DATE */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDatePicker((v) => !v);
                  setShowFilter(false);
                  setShowSort(false);
                }}
                className="bg-white border border-gray-300 rounded-xl w-10 h-10 flex items-center justify-center hover:bg-orange-50"
              >
                <FaCalendarAlt size={16} />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-2xl shadow-lg p-4 z-50">
                  <p className="font-semibold mb-2">Start date (≥)</p>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setCurrentPage(1);
                      setShowDatePicker(false);
                    }}
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => {
                      setSelectedDate("");
                      setCurrentPage(1);
                      setShowDatePicker(false);
                    }}
                    className="w-full mt-3 py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300"
                  >
                    Clear date
                  </button>
                </div>
              )}
            </div>

            {/* FILTER */}
            <div className="relative">
              <button
                onClick={() => {
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
                              selectedLocation === loc ? "bg-orange-200" : ""
                            }`}
                            onClick={() => {
                              setSelectedLocation(loc);
                              setSelectedDuration("");
                              setSelectedDate("");
                              setCurrentPage(1);
                              setShowFilter(false);
                            }}
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
                            key={d}
                            className={`block w-full text-left px-3 py-2 rounded-xl hover:bg-orange-100 ${
                              selectedDuration === d ? "bg-orange-200" : ""
                            }`}
                            onClick={() => {
                              setSelectedDuration(d);
                              setSelectedLocation("");
                              setSelectedDate("");
                              setCurrentPage(1);
                              setShowFilter(false);
                            }}
                          >
                            {d === "" ? "All" : `${d} days`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={clearAllFilters}
                    className="w-full mt-4 py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300"
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
                    ["recent", "Recently Added"],
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

        {/* LIST */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-500 text-lg">
            Loading tours...
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch relative z-10">
            {tours.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        )}

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          visiblePages={getVisiblePages()}
        />

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
                  <div className="text-sm text-gray-600">Start date (≥)</div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        setCurrentPage(1);
                        closeMobilePanel();
                      }}
                      className="py-3 rounded-2xl bg-orange-500 text-white font-semibold"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDate("");
                        setCurrentPage(1);
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
                          onClick={() => {
                            setSelectedLocation(loc);
                            setSelectedDuration("");
                            setSelectedDate("");
                            setCurrentPage(1);
                          }}
                          className={`py-3 px-2 rounded-2xl border text-sm ${
                            selectedLocation === loc
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
                          key={d}
                          onClick={() => {
                            setSelectedDuration(d);
                            setSelectedLocation("");
                            setSelectedDate("");
                            setCurrentPage(1);
                          }}
                          className={`py-3 rounded-2xl border text-sm ${
                            selectedDuration === d
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
                      onClick={closeMobilePanel}
                      className="py-3 rounded-2xl bg-orange-500 text-white font-semibold"
                    >
                      Done
                    </button>
                    <button
                      onClick={clearAllFilters}
                      className="py-3 rounded-2xl bg-gray-200 font-semibold"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* SORT */}
              {mobilePanel === "sort" && (
                <div className="space-y-2">
                  {[
                    ["recent", "Recently Added"],
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
