import React, { useEffect, useState, useCallback } from "react";
import {
  FaFilter,
  FaSearch,
  FaSortAmountDownAlt,
  FaSortAmountUpAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import TourCard from "../components/pages/Tour/TourCard";
import Pagination from "../utils/Pagination";
import BookingVideo from "../components/pages/Tour/Video";
import BookingHotel from "../components/pages/Tour/BookingHotel";
import Tour from "../models/Tour";

export default function TourPage() {
  const [tours, setTours] = useState([]);
  const [locations, setLocations] = useState([]);
  const [durations] = useState(["", 2, 3, 4, 5, 7, 10]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 8;

  /** ================== API SORT FORMAT ================== */
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

  /** ================== FETCH TOURS (BACKEND) ================== */
  const fetchTours = useCallback(async () => {
    setIsLoading(true);

    try {
      let url = `http://localhost:8080/tours?page=${currentPage - 1}&size=${pageSize}`;

      // SORT
      url += `&sort=${mapSort()}`;

      // SEARCH
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      // LOCATION
      if (selectedLocation) {
        url += `&destination=${encodeURIComponent(selectedLocation)}`;
      }

      // DURATION
      if (selectedDuration) {
        url += `&durationDays=${selectedDuration}`;
      }

      // DATE >=
      if (selectedDate) {
        url += `&startDate%3E=${selectedDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setTotalPages(data.page.totalPages);

      const result = data._embedded.tours.map((t) => {
        return new Tour(
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
        );
      });

      setTours(result);
    } catch (e) {
      console.error("Fetch tours error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    selectedLocation,
    selectedDuration,
    selectedDate,
    sortOrder,
  ]);

  /** ================== LOAD LOCATIONS ================== */
  const loadLocations = async () => {
    try {
      const res = await fetch("http://localhost:8080/tours?size=9999");
      const data = await res.json();

      const locs = [...new Set(data._embedded.tours.map((t) => t.destination))];
      setLocations(locs);
    } catch (e) {
      console.error("Location error: ", e);
    }
  };

  /** FIRST LOAD */
  useEffect(() => {
    fetchTours();
    loadLocations();
  }, []);

  /** AUTO FETCH WHEN FILTER CHANGES */
  useEffect(() => {
    fetchTours();
  }, [
    sortOrder,
    selectedLocation,
    selectedDuration,
    selectedDate,
    currentPage,
  ]);

  /** ================== PAGINATION 5 ITEMS ================== */
  const getVisiblePages = () => {
    const pages = [];
    const max = 5;

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + max - 1, totalPages);

    if (end - start < max - 1) {
      start = Math.max(end - max + 1, 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="bg-gray-50 py-12 flex flex-col items-center min-h-screen">
      {/* FIXED: NO MORE OVERFLOW CLIP */}
      <div className="w-full max-w-7xl mx-auto px-4 relative z-30 overflow-visible">

        <h2 className="text-4xl font-podcast text-gray-800 mb-6">
          Tour Packages
        </h2>

        {/* ================== TOP BAR ================== */}
        <div className="flex items-center justify-between gap-3 mb-10 relative z-[999]">

          {/* SEARCH */}
          <div className="flex items-center flex-1 bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm relative z-[999]">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 text-sm outline-none"
            />
            <FaSearch size={16} className="text-gray-600" />
          </div>

          {/* DATE PICKER */}
          <div className="relative z-[999]">
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowFilter(false);
                setShowSort(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-orange-50"
            >
              <FaCalendarAlt size={16} className="text-gray-700" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-3 z-[9999]">
                <p className="font-semibold mb-2 text-gray-700">Start date (≥)</p>

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

          {/* FILTER */}
          <div className="relative z-[999]">
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
              <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg p-4 grid grid-cols-2 gap-3 z-[9999]">
                {/* LOCATION */}
                <div>
                  <p className="font-semibold mb-2">Location</p>
                  {["", ...locations].map((loc) => (
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
          <div className="relative z-[999]">
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
              <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg p-3 z-[9999]">
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

        {/* ================== LIST ================== */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-500 text-lg">
            Loading tours...
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative z-0">
            {tours.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        )}

        {/* ================== PAGINATION ================== */}
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
