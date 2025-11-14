import React, { useEffect, useState } from "react";
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
  const [allTours, setAllTours] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const toursPerPage = 8;

  /** Fetch All */
  const fetchAllTours = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/tours?page=0&size=9999&sort=createdAt,desc"
      );
      const data = await res.json();

      const full = data._embedded.tours.map((t) => {
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

      setAllTours(full);
    } catch (e) {
      console.error("Load all tours error:", e);
    }
  };

  /** Pagination fetch */
  const fetchPagedTours = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(
        `http://localhost:8080/tours?page=${
          currentPage - 1
        }&size=${toursPerPage}`
      );

      const data = await res.json();
      setTotalPages(data.page.totalPages);

      const paging = data._embedded.tours.map((t) => {
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

      setTours(paging);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTours();
    fetchPagedTours();
  }, []);

  /** FILTER + SORT */
  const applyFiltersAndSorting = () => {
    let result = [...allTours];

    // search
    if (searchTerm.trim() !== "") {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // location
    if (selectedLocation !== "All") {
      result = result.filter((t) => t.destination === selectedLocation);
    }

    // duration
    if (selectedDuration !== "All") {
      result = result.filter(
        (t) => Number(t.durationDays) === Number(selectedDuration)
      );
    }

    // ⭐ DATE FILTER
    if (selectedDate) {
      const selected = new Date(selectedDate);

      result = result.filter((t) => {
        if (!t.startDate) return false;
        const start = new Date(t.startDate);
        return start >= selected;
      });

      // ⭐ PRIORITY SORT: nearest date first
      result.sort((a, b) => {
        const da = new Date(a.startDate);
        const db = new Date(b.startDate);

        const diffA = Math.abs(da - selected);
        const diffB = Math.abs(db - selected);

        return diffA - diffB; // nhỏ hơn → gần hơn → lên đầu
      });

      return result;
    }

    // ⭐ NORMAL SORTING (không lọc ngày)
    if (sortOrder === "discount") {
      result.sort((a, b) => b.percentDiscount - a.percentDiscount);
    } else if (sortOrder === "asc") {
      result.sort((a, b) => a.priceAdult - b.priceAdult);
    } else if (sortOrder === "desc") {
      result.sort((a, b) => b.priceAdult - a.priceAdult);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate) -
          new Date(a.createdAt || a.startDate)
      );
    }

    return result;
  };

  /** When filter changes */
  useEffect(() => {
    const filtered = applyFiltersAndSorting();

    const pages = Math.max(1, Math.ceil(filtered.length / toursPerPage));
    setTotalPages(pages);

    const safePage = Math.min(currentPage, pages);
    const start = (safePage - 1) * toursPerPage;
    const end = start + toursPerPage;

    setTours(filtered.slice(start, end));
  }, [
    searchTerm,
    selectedLocation,
    selectedDuration,
    selectedDate,
    sortOrder,
    currentPage,
  ]);

  const locations = ["All", ...new Set(allTours.map((t) => t.destination))];
  const durations = ["All", 2, 3, 4, 5, 7, 10];

  /** pagination numbers 5 items */
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
      <div className="w-full max-w-[calc(100%-280px)] relative z-10">
        <h2 className="text-4xl font-podcast text-gray-800 mb-6">
          Tour Packages
        </h2>

        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-3 mb-10 relative">
          {/* SEARCH */}
          <div className="flex items-center flex-1 bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm">
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

          {/* DATE PICKER BUTTON */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDatePicker((prev) => !prev);
                setShowFilter(false);
                setShowSort(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-orange-50"
            >
              <FaCalendarAlt size={16} className="text-gray-700" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-[9999]">
                <p className="font-semibold mb-2 text-gray-700">Start date</p>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setShowDatePicker(false);
                    setCurrentPage(1);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none"
                />

                <button
                  onClick={() => {
                    setSelectedDate("");
                    setShowDatePicker(false);
                    setCurrentPage(1);
                  }}
                  className="w-full mt-2 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
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
                setShowFilter((prev) => !prev);
                setShowSort(false);
                setShowDatePicker(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-orange-50"
            >
              <FaFilter size={16} />
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg p-4 grid grid-cols-2 gap-3 z-[9999]">
                <div>
                  <p className="font-semibold mb-2">Location</p>
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      className={`block w-full text-left px-3 py-1 rounded-md hover:bg-orange-100 ${
                        selectedLocation === loc ? "bg-orange-200" : ""
                      }`}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setShowFilter(false);
                        setCurrentPage(1);
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                <div>
                  <p className="font-semibold mb-2">Duration</p>
                  {durations.map((d) => (
                    <button
                      key={d}
                      className={`block w-full text-left px-3 py-1 rounded-md hover:bg-orange-100 ${
                        selectedDuration === d ? "bg-orange-200" : ""
                      }`}
                      onClick={() => {
                        setSelectedDuration(d);
                        setShowFilter(false);
                        setCurrentPage(1);
                      }}
                    >
                      {d === "All" ? "All" : `${d} days`}
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
                setShowSort((prev) => !prev);
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
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-[9999]">
                <p className="font-semibold mb-2">Sort by</p>

                {[
                  ["recent", "Recently Added"],
                  ["discount", "Biggest Discount"],
                  ["asc", "Low → High"],
                  ["desc", "High → Low"],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    className={`block w-full text-left px-3 py-1.5 rounded-md hover:bg-orange-100 ${
                      sortOrder === k ? "bg-orange-200" : ""
                    }`}
                    onClick={() => {
                      setSortOrder(k);
                      setShowSort(false);
                      setCurrentPage(1);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LIST */}
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
