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
} from "../apis/Tour";

import TourCard from "../components/pages/Tour/TourCard";
import Pagination from "../utils/Pagination";
import BookingVideo from "../components/pages/Tour/Video";
import BookingHotel from "../components/pages/Tour/BookingHotel";
import Tour from "../models/Tour";

export default function TourPage() {
  const [tours, setTours] = useState([]);

  // Hard-coded locations
  const [locations] = useState([
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

  const [durations] = useState(["", 2, 3, 4, 5, 7, 10]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search + debounce
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [sortOrder, setSortOrder] = useState("recent");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 8;

  /** =============================
   *  ⏳ Debounce 2 seconds
   * ============================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /** SORT */
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

  /** =============================
   *  FETCH TOURS
   * ============================= */
  const fetchTours = useCallback(async () => {
    setIsLoading(true);

    try {
      let data;
      let isSearchEndpoint = false;
      let sortDateMode = false;

      // 🔍 Search by name
      if (debouncedSearchTerm.trim()) {
        data = await searchByTitle(debouncedSearchTerm);
        isSearchEndpoint = true;
      }
      // 📍 Location
      else if (selectedLocation) {
        data = await searchByLocation(selectedLocation);
        isSearchEndpoint = true;
      }
      // ⏳ Duration
      else if (selectedDuration) {
        data = await searchByDuration(selectedDuration);
        isSearchEndpoint = true;
      }
      // 📅 Start Date >=
      else if (selectedDate) {
        data = await searchByStartDate(selectedDate);
        isSearchEndpoint = true;
        sortDateMode = true;
      }
      // Default (with backend pagination)
      else {
        data = await getTours(currentPage - 1, pageSize, mapSort());
        isSearchEndpoint = false;
      }

      /** Normalize list */
      let rawList = Array.isArray(data)
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

      /** Sort by date (only for date filter) */
      if (sortDateMode) {
        result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      }

      /** FE pagination for search mode */
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

  /** FIRST LOAD */
  useEffect(() => {
    fetchTours();
  }, []);

  /** Reload when filters change */
  useEffect(() => {
    fetchTours();
  }, [
    sortOrder,
    debouncedSearchTerm,
    selectedLocation,
    selectedDuration,
    selectedDate,
    currentPage,
  ]);

  /** =============================
   *  Pagination slide effect
   * ============================= */
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

  return (
    <div className="bg-gray-50 py-12 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 relative z-30">
        <h2 className="text-4xl font-podcast text-gray-800 mb-6">
          Tour Packages
        </h2>

        {/* ================= TOP BAR ================= */}
        <div className="flex items-center justify-between gap-3 mb-10">

          {/* 🔍 SEARCH */}
          <div className="flex items-center flex-1 bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm outline-none"
            />
            <FaSearch size={16} className="text-gray-600" />
          </div>

          {/* 📅 DATE PICKER */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowFilter(false);
                setShowSort(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-orange-50"
            >
              <FaCalendarAlt size={16} />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-3">
                <p className="font-semibold mb-2">Start date (≥)</p>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                    setShowDatePicker(false);
                  }}
                  className="w-full border rounded px-3 py-1.5 text-sm"
                />

                <button
                  onClick={() => {
                    setSelectedDate("");
                    setCurrentPage(1);
                    setShowDatePicker(false);
                  }}
                  className="w-full mt-2 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  Clear date
                </button>
              </div>
            )}
          </div>

          {/* 🎛 FILTER */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilter(!showFilter);
                setShowSort(false);
                setShowDatePicker(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-orange-50"
            >
              <FaFilter size={16} />
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg p-4 grid grid-cols-2 gap-3">

                {/* LOCATION */}
                <div>
                  <p className="font-semibold mb-2">Location</p>
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      className={`block w-full text-left px-3 py-1 rounded hover:bg-orange-100 ${
                        selectedLocation === loc ? "bg-orange-200" : ""
                      }`}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setCurrentPage(1);
                        setShowFilter(false);
                      }}
                    >
                      {loc === "" ? "All" : loc}
                    </button>
                  ))}
                </div>

                {/* DURATION */}
                <div>
                  <p className="font-semibold mb-2">Duration</p>
                  {durations.map((d) => (
                    <button
                      key={d}
                      className={`block w-full text-left px-3 py-1 rounded hover:bg-orange-100 ${
                        selectedDuration === d ? "bg-orange-200" : ""
                      }`}
                      onClick={() => {
                        setSelectedDuration(d);
                        setCurrentPage(1);
                        setShowFilter(false);
                      }}
                    >
                      {d === "" ? "All" : `${d} days`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SORT */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSort(!showSort);
                setShowFilter(false);
                setShowDatePicker(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-orange-50"
            >
              {sortOrder === "asc" ? (
                <FaSortAmountUpAlt size={16} />
              ) : (
                <FaSortAmountDownAlt size={16} />
              )}
            </button>

            {showSort && (
              <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg p-3">
                <p className="font-semibold mb-2">Sort by</p>

                {[
                  ["recent", "Recently Added"],
                  ["discount", "Biggest Discount"],
                  ["asc", "Low → High"],
                  ["desc", "High → Low"],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    className={`block w-full text-left px-3 py-1.5 rounded hover:bg-orange-100 ${
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

        {/* ================= LIST ================= */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-500 text-lg">
            Loading tours...
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {tours.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          visiblePages={getVisiblePages()}
        />

        <BookingHotel />
        <BookingVideo />
      </div>
    </div>
  );
}
