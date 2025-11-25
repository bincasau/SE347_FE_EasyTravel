import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortAmountUp,
  faSortAmountDown,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import RoomCard from "./RoomCard";
import Pagination from "@/utils/Pagination";
import { getRoomsByHotel } from "@/apis/Room";

const RoomList = () => {
  const { hotelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const roomsPerPage = 6;

  // Lấy page từ URL
  const currentPage = parseInt(searchParams.get("page")) || 1;

  // Fetch rooms
  useEffect(() => {
    if (!hotelId) return;

    setIsLoading(true);
    setError(null);

    getRoomsByHotel(hotelId)
      .then((data) => {
        const fetchedRooms = data?._embedded?.rooms || [];
        setRooms(fetchedRooms);
      })
      .catch(() => setError("Không thể tải danh sách phòng."))
      .finally(() => setIsLoading(false));
  }, [hotelId]);

  // Sort
  const sortedRooms = [...rooms].sort((a, b) =>
    sortOrder === "asc"
      ? (a.price || 0) - (b.price || 0)
      : (b.price || 0) - (a.price || 0)
  );

  // Pagination
  const totalPages = Math.ceil(sortedRooms.length / roomsPerPage);
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const indexOfLast = safePage * roomsPerPage;
  const indexOfFirst = indexOfLast - roomsPerPage;
  const currentRooms = sortedRooms.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setSearchParams(nextPage === 1 ? {} : { page: nextPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  //  BACK: Quay về đúng trang hotel trước đó
  const handleBack = () => {
    const prevHotelPage = sessionStorage.getItem("hotelPrevPage") || 1;
    navigate(`/hotels?page=${prevHotelPage}`);
  };

  // UI state
  if (isLoading)
    return (
      <p className="text-center text-gray-400 mt-6 animate-pulse">
        Đang tải danh sách phòng...
      </p>
    );

  if (error) return <p className="text-center text-red-500 mt-6">{error}</p>;

  if (rooms.length === 0)
    return (
      <p className="text-center text-gray-500 mt-6">
        Không có phòng nào được tìm thấy.
      </p>
    );

  return (
    <div className="w-full py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          className="flex items-center gap-2 
            border border-orange-500 text-orange-500 
            bg-white text-[15px] font-medium 
            px-4 py-1.5 rounded-md
            hover:bg-orange-500 hover:text-white 
            transition-all duration-200 shadow-sm"
          onClick={handleBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Trở về
        </button>

        <h2 className="text-xl font-semibold text-gray-800">
          Danh sách phòng ({rooms.length})
        </h2>

        <button
          onClick={toggleSortOrder}
          className="border rounded-full p-2 hover:bg-gray-100"
        >
          <FontAwesomeIcon
            icon={sortOrder === "asc" ? faSortAmountUp : faSortAmountDown}
          />
        </button>
      </div>

      {/* Rooms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRooms.map((room) => (
          <RoomCard key={room.roomId} room={room} hotelId={hotelId} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default RoomList;
