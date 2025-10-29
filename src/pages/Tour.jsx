import React, { useEffect, useState } from "react";
import { FaFilter, FaSearch, FaSortAmountDownAlt, FaSortAmountUpAlt } from "react-icons/fa";
import TourCard from "../components/pages/Tour/TourCard";
import Pagination from "../utils/Pagination";
import BookingVideo from "../components/pages/Tour/Video";
import BookingHotel from "../components/pages/Tour/BookingHotel";
import Tour from "../models/Tour";
import toursData from "../data/Tour.json";

export default function TourPage() {
  const [tours, setTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All");

  const toursPerPage = 8;

  useEffect(() => {
    const loadedTours = toursData.map(
      (t) =>
        new Tour(t.id, t.title, t.price, t.img, t.desc, t.schedule, t.group, t.location)
    );
    setTours(loadedTours);
  }, []);

  // Lọc + tìm kiếm
  const filteredTours = tours.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedLocation === "All" || t.location === selectedLocation)
  );

  // Sắp xếp theo giá
  const sortedTours = [...filteredTours].sort((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price
  );

  // Phân trang
  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = sortedTours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(sortedTours.length / toursPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                <p className="font-semibold mb-2 text-gray-700">Filter by Location</p>
                {["All", "Tuscany", "Venice", "Rome", "Florence", "Milan"].map(
                  (loc) => (
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
                  )
                )}
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
                <p className="font-semibold mb-2 text-gray-700">Sort by Price</p>
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
          {currentTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        {/* ✅ Pagination riêng */}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        <BookingHotel />
        <BookingVideo />
      </div>
    </div>
  );
}
