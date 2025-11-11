import React, { useEffect, useState } from "react";
import {
  FaFilter,
  FaSearch,
  FaSortAmountDownAlt,
  FaSortAmountUpAlt,
} from "react-icons/fa";
import TourCard from "../components/pages/Tour/TourCard";
import Pagination from "../utils/Pagination";
import BookingVideo from "../components/pages/Tour/Video";
import BookingHotel from "../components/pages/Tour/BookingHotel";
import Tour from "../models/Tour";

export default function TourPage() {
  const [tours, setTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [isLoading, setIsLoading] = useState(false);

  const toursPerPage = 8;

  // ✅ Fetch theo trang (8 tour mỗi lần)
  useEffect(() => {
    const fetchToursByPage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:8080/tours?page=${currentPage - 1}&size=${toursPerPage}`
        );
        if (!response.ok) throw new Error("Failed to fetch tours");

        const data = await response.json();
        setTotalPages(data.page.totalPages);

        const loadedTours = data._embedded.tours.map(
          (t) =>
            new Tour(
              t.tourId,
              t.title,
              t.priceAdult,
              t.mainImage,
              t.description,
              t.startDate,
              t.destination,
              t.percentDiscount,
              t.limitSeats
            )
        );

        setTours(loadedTours);
      } catch (error) {
        console.error("Error fetching tours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToursByPage();
  }, [currentPage]);

  // ✅ Tạo danh sách địa điểm động
  const locations = ["All", ...new Set(tours.map((t) => t.destination))];

  // 🔍 Lọc + tìm kiếm
  const filteredTours = tours.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedLocation === "All" || t.destination === selectedLocation)
  );

  // ↕️ Sắp xếp theo giá
  const sortedTours = [...filteredTours].sort((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price
  );

  // ⚙️ Tạo danh sách trang động (hiển thị tối đa 3 trang)
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 3;
    let startPage = Math.max(currentPage - 1, 1);
    let endPage = Math.min(startPage + maxVisible - 1, totalPages);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    setShowSort(false);
  };

  return (
    <div className="bg-gray-50 py-12 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-[calc(100%-280px)] mx-auto relative">
        {/* Tiêu đề */}
        <h2 className="text-4xl font-podcast text-gray-800 mb-6 text-left">
          Tour Packages
        </h2>

        {/* Thanh tìm kiếm + filter + sort */}
        <div className="flex items-center justify-between gap-3 mb-10 relative">
          {/* Search bar */}
          <div className="flex items-center w-full bg-white border border-gray-300 rounded-full px-5 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Search tours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
            />
            <button className="text-gray-600 hover:text-orange-500">
              <FaSearch size={16} />
            </button>
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilter(!showFilter);
                setShowSort(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex items-center justify-center shadow-sm hover:bg-orange-50"
            >
              <FaFilter size={16} className="text-gray-600" />
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 text-sm">
                <p className="font-semibold mb-2 text-gray-700">
                  Filter by Location
                </p>
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowFilter(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 rounded-md hover:bg-orange-100 ${
                      selectedLocation === loc ? "bg-orange-200" : ""
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSort(!showSort);
                setShowFilter(false);
              }}
              className="bg-white border border-gray-300 rounded-lg w-10 h-10 flex items-center justify-center shadow-sm hover:bg-orange-50"
            >
              {sortOrder === "asc" ? (
                <FaSortAmountUpAlt size={16} className="text-gray-600" />
              ) : (
                <FaSortAmountDownAlt size={16} className="text-gray-600" />
              )}
            </button>

            {showSort && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 text-sm">
                <p className="font-semibold mb-2 text-gray-700">
                  Sort by Price
                </p>
                <button
                  onClick={() => handleSortChange("asc")}
                  className={`block w-full text-left px-3 py-1.5 rounded-md hover:bg-orange-100 ${
                    sortOrder === "asc" ? "bg-orange-200" : ""
                  }`}
                >
                  Low to High
                </button>
                <button
                  onClick={() => handleSortChange("desc")}
                  className={`block w-full text-left px-3 py-1.5 rounded-md hover:bg-orange-100 ${
                    sortOrder === "desc" ? "bg-orange-200" : ""
                  }`}
                >
                  High to Low
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid Tour */}
        {isLoading ? (
          <div className="flex justify-center py-16 text-gray-500 text-lg">
            Đang tải danh sách tour...
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
            {sortedTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}

        {/* ✅ Pagination dùng component bạn gửi */}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          visiblePages={getVisiblePages()} // 3 số trang động
        />

        {/* Booking sections */}
        <BookingHotel />
        <BookingVideo />
      </div>
    </div>
  );
}
