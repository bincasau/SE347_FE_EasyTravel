import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortAmountUp,
  faSortAmountDown,
} from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";

import RoomCard from "./RoomCard";
import Pagination from "@/utils/Pagination";
import { getRoomsByHotel } from "@/apis/Room";

const RoomList = ({ hotelId, hotelName }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [roomType, setRoomType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const roomsPerPage = 6;
  const currentPage = parseInt(searchParams.get("page")) || 1;

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

  // Lọc theo loại phòng
  const filteredRooms =
    roomType === "all"
      ? rooms
      : rooms.filter(
          (room) => room.roomType?.toLowerCase() === roomType.toLowerCase()
        );

  // Sắp xếp theo giá
  const sortedRooms = [...filteredRooms].sort((a, b) =>
    sortOrder === "asc"
      ? (a.price || 0) - (b.price || 0)
      : (b.price || 0) - (a.price || 0)
  );

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

  if (isLoading)
    return <p className="text-center mt-6 animate-pulse">Đang tải...</p>;

  if (error) return <p className="text-center text-red-500 mt-6">{error}</p>;

  if (rooms.length === 0)
    return <p className="text-center mt-6">Không có phòng nào.</p>;

  return (
    <div className="w-full py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Danh sách phòng ({filteredRooms.length})
        </h2>

        <div className="flex items-center gap-3">
          {/* Nút lọc loại phòng */}
          <select
            value={roomType}
            onChange={(e) => {
              setRoomType(e.target.value);
              setSearchParams({});
            }}
            className="border rounded-lg px-3 py-1.5"
          >
            <option value="all">Tất cả</option>
            <option value="Standard">Standard</option>
            <option value="VIP">VIP</option>
            <option value="President">President</option>
          </select>

          {/* Nút sắp xếp */}
          <button onClick={toggleSortOrder} className="border rounded-full p-2">
            <FontAwesomeIcon
              icon={sortOrder === "asc" ? faSortAmountUp : faSortAmountDown}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRooms.map((room) => {
          const roomKey = room.roomId ?? room.id; // ✅ fallback
          return (
            <RoomCard
              key={roomKey}
              room={room}
              hotelId={hotelId}
              hotelName={hotelName} // ✅ để RoomCard tạo slug hotel đẹp
            />
          );
        })}
      </div>

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
