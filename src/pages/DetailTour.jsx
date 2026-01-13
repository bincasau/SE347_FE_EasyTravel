import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ShortInfor from "../components/pages/DetailTour/ShortInfor";
import Detail from "../components/pages/DetailTour/Detail";
import Gallery from "../components/pages/DetailTour/Gallery";
import Itineraries from "../components/pages/DetailTour/Itineraries";
import Reviews from "../components/pages/DetailTour/Reviews";
import { buildTourSlug, extractIdFromSlug } from "@/utils/slug";

export default function DetailTour() {
  const { slugId } = useParams(); // ✅ slug-id từ URL
  const navigate = useNavigate();

  const id = useMemo(() => extractIdFromSlug(slugId), [slugId]);

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        if (!id) throw new Error("URL không hợp lệ (thiếu id).");

        const res = await fetch(`http://localhost:8080/tours/${id}`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu tour.");
        const data = await res.json();
        setTour(data);

        // ✅ nếu user gõ sai slug, tự điều hướng về đúng slug (không reload)
        const correct = buildTourSlug(id, data?.title);
        if (slugId !== correct) {
          navigate(`/detailtour/${correct}`, { replace: true });
        }
      } catch (err) {
        console.error("❌ Lỗi khi fetch tour:", err);
        setTour(null);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchTour();
  }, [id, slugId, navigate]);

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

      {/* ✅ dùng id thật để gọi API con */}
      <Itineraries tourId={id} />
      <Gallery tourId={id} />

      {/* ✅ fallback: nếu tour.tourId không có thì dùng id */}
      <Reviews tourId={tour.tourId ?? id} tourTitle={tour.title} />
    </div>
  );
}
