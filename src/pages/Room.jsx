import React from "react";
import { useParams } from "react-router-dom";
import RoomList from "@/components/pages/Hotel/Room/RoomList";

export const Room = () => {
  const { id } = useParams();
  const hotelId = parseInt(id, 10); // ép kiểu sang số

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <RoomList hotelId={hotelId} />
    </div>
  );
};
