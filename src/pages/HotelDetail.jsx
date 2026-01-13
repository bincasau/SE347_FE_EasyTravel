import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import RoomList from "@/components/pages/DetailHotel/Room/RoomList";
import HotelDetail from "@/components/pages/DetailHotel/HotelDetail";
import HotelReviews from "@/components/pages/DetailHotel/HotelReviews";

import { extractIdFromSlug } from "@/utils/slug";

export default function HotelDetailPage() {
  const { slugId } = useParams();

  // ✅ lấy id từ "slug-id"
  const hotelId = useMemo(() => extractIdFromSlug(slugId), [slugId]);

  if (!hotelId) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 text-center text-red-500">
        URL không hợp lệ (thiếu id khách sạn).
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <HotelDetail hotelId={hotelId} />

      <div className="mt-10">
        <RoomList hotelId={hotelId} />
      </div>

      <div className="mt-14 mb-14">
        <HotelReviews hotelId={hotelId} />
      </div>
    </div>
  );
}
