import React from "react";
import { useParams } from "react-router-dom";
import RoomList from "@/components/pages/DetailHotel/Room/RoomList";
import HotelDetail from "@/components/pages/DetailHotel/HotelDetail";
import HotelReviews from "@/components/pages/DetailHotel/HotelReviews";

export default function HotelDetailPage() {
  const { id } = useParams();
  const hotelId = parseInt(id, 10);

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
};
