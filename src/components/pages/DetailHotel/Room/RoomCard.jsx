import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { buildTourSlug } from "@/utils/slug";

const S3_ROOM_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";

const FALLBACK_IMAGE = `${S3_ROOM_BASE}/standard_bed.jpg`;

// ✅ thêm hotelName (optional) để làm slug đẹp hơn
const RoomCard = ({ room, hotelId, hotelName }) => {
  // ===== BUILD IMAGE LIST (SAFE) =====
  const images = useMemo(() => {
    const list = [];

    if (room?.imageBed) list.push(`${S3_ROOM_BASE}/${room.imageBed}`);
    if (room?.imageWC) list.push(`${S3_ROOM_BASE}/${room.imageWC}`);

    return list.length > 0 ? list : [FALLBACK_IMAGE];
  }, [room]);

  const [index, setIndex] = useState(0);
  const total = images.length;

  // ===== HANDLERS =====
  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (total <= 1) return;
    setIndex((prev) => (prev + 1) % total);
  };

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (total <= 1) return;
    setIndex((prev) => (prev - 1 + total) % total);
  };

  // ✅ resolve ids an toàn
  const roomId = room?.roomId ?? room?.id ?? null;
  const roomTitle = room?.roomType || "room";
  const safeHotelTitle = hotelName || "hotel";

  // ✅ slug-id cho query
  const hotelSlugId = hotelId ? buildTourSlug(hotelId, safeHotelTitle) : "";
  const roomSlugId = roomId ? buildTourSlug(roomId, roomTitle) : "";

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
      {/* IMAGE SLIDER */}
      <div className="relative w-full h-56 overflow-hidden select-none">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out will-change-transform"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`room-${i}`}
              className="w-full h-full object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          ))}
        </div>

        {/* ARROWS */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 
              bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full
              flex items-center justify-center transition"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 
              bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full
              flex items-center justify-center transition"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </>
        )}

        {/* DOTS */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold capitalize mb-1">{roomTitle}</h3>

        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {room?.desc || "Hiện chưa có mô tả phòng."}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>{room?.numberOfGuest || 0} khách</span>
          <span className="text-orange-500 font-semibold">
            {room?.price?.toLocaleString("vi-VN")}₫ / đêm
          </span>
        </div>

        {hotelId && roomId ? (
          <Link
            // ✅ dùng slug-id cho query (RoomBooking đã support)
            to={`/booking-room?hotel=${encodeURIComponent(
              hotelSlugId
            )}&room=${encodeURIComponent(roomSlugId)}`}
            className="mt-auto text-center text-sm font-semibold text-white 
            bg-orange-500 hover:bg-orange-600 rounded-full py-2 transition"
          >
            Đặt ngay
          </Link>
        ) : (
          <button
            disabled
            className="mt-auto text-center text-sm font-semibold text-white 
            bg-gray-400 rounded-full py-2 cursor-not-allowed"
          >
            Không khả dụng
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
