import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ShortInfor from "../components/pages/DetailTour/ShortInfor";
import Detail from "../components/pages/DetailTour/Detail";
import Gallery from "../components/pages/DetailTour/Gallery";
import Itineraries from "../components/pages/DetailTour/Itineraries";
import Reviews from "../components/pages/DetailTour/Reviews";

export default function DetailTour() {
  const { id } = useParams(); // ✅ id từ URL
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${id}`);
        if (!res.ok) {
          throw new Error("Không thể tải dữ liệu tour.");
        }
        const data = await res.json();
        setTour(data);
      } catch (err) {
        console.error("❌ Lỗi khi fetch tour:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Đang tải thông tin tour...
      </div>
    );

  if (!tour)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        Không tìm thấy tour.
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <ShortInfor tour={tour} />
      <Detail tour={tour} />
      <Itineraries tourId={id} />
      <Gallery tourId={id} />
      <Reviews tourId={id} />
    </div>
  );
}
