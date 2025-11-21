import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortAmountUp,
  faSortAmountDown,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useSearchParams } from "react-router-dom";
import RoomCard from "./RoomCard";
import Pagination from "@/utils/Pagination";

const RoomList = () => {
  const { hotelId } = useParams(); //  lấy hotelId từ URL
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const roomsPerPage = 6;

  //  đọc page từ query string
  const currentPage = parseInt(searchParams.get("page")) || 1;

  //  Fetch danh sách phòng theo hotelId
  useEffect(() => {
    if (!hotelId) return;
    setIsLoading(true);
    setError(null);

    console.log("Fetching rooms for hotelId:", hotelId);

    fetch(`http://localhost:8080/hotels/${hotelId}/rooms`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải danh sách phòng");
        return res.json();
      })
      .then((data) => {
        const fetchedRooms = data._embedded?.rooms || [];
        console.log("Fetched rooms:", fetchedRooms);
        setRooms(fetchedRooms);
      })
      .catch((err) => {
        console.error("Lỗi fetch rooms:", err);
        setError("Không thể tải danh sách phòng.");
      })
      .finally(() => setIsLoading(false));
  }, [hotelId]);

  //  Sắp xếp theo giá
  const sortedRooms = [...rooms].sort((a, b) =>
    sortOrder === "asc"
      ? (a.price || 0) - (b.price || 0)
      : (b.price || 0) - (a.price || 0)
  );

  //  Phân trang
  const totalPages = Math.ceil(sortedRooms.length / roomsPerPage);
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const indexOfLast = safePage * roomsPerPage;
  const indexOfFirst = indexOfLast - roomsPerPage;
  const currentRooms = sortedRooms.slice(indexOfFirst, indexOfLast);

  //  Khi chuyển trang, đổi URL (để SEO + reload vẫn đúng)
  const handlePageChange = (page) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setSearchParams(nextPage === 1 ? {} : { page: nextPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  //  Loading / Error / Empty
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
      {/* Header điều khiển */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Danh sách phòng ({rooms.length})
        </h2>

        <button
          onClick={toggleSortOrder}
          className="border rounded-full p-2 hover:bg-gray-100 flex items-center justify-center"
          title={
            sortOrder === "asc"
              ? "Sắp xếp giá tăng dần"
              : "Sắp xếp giá giảm dần"
          }
        >
          <FontAwesomeIcon
            icon={sortOrder === "asc" ? faSortAmountUp : faSortAmountDown}
          />
        </button>
      </div>

      {/* Danh sách phòng */}
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
