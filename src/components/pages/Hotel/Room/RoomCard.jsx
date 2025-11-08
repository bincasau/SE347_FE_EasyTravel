import React from "react";
import { Link } from "react-router-dom";

const RoomCard = ({ room, hotelId }) => {
  // 🔹 Chọn ảnh theo loại phòng
  const getRoomImage = () => {
    switch (room.roomType?.toLowerCase()) {
      case "vip":
        return "/images/room/vip.jpg";
      case "president":
        return "/images/room/president.jpg";
      default:
        return "/images/room/standard.jpg";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Ảnh phòng */}
      <img
        src={getRoomImage()}
        alt={room.roomType}
        className="w-full h-56 object-cover"
      />

      {/* Nội dung */}
      <div className="p-4 flex flex-col h-full">
        <h3 className="text-lg font-semibold capitalize">{room.roomType}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{room.desc}</p>

        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-500">
            {room.numberOfGuest} khách
          </span>
          <span className="text-orange-500 font-semibold">
            {room.price?.toLocaleString("vi-VN")}₫ / đêm
          </span>
        </div>

        {/* ✅ Nút đặt phòng */}
        {hotelId ? (
          <Link
            to={`/booking-room?hotel=${hotelId}&room=${room.roomId}`}
            className="mt-4 text-center text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-full py-2 transition"
          >
            Đặt ngay
          </Link>
        ) : (
          <button
            disabled
            className="mt-4 text-center text-sm font-semibold text-white bg-gray-400 rounded-full py-2 cursor-not-allowed"
          >
            Không khả dụng
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
