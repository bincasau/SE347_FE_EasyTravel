import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ import navigate để điều hướng

// ✅ Import ảnh
import travel1 from "../../../assets/images/Tour/travel1.jpg";
import travel2 from "../../../assets/images/Tour/travel2.jpg";
import travel3 from "../../../assets/images/Tour/travel3.jpg";
import travel4 from "../../../assets/images/Tour/travel4.jpg";
import travel5 from "../../../assets/images/Tour/travel5.jpg";
import travel6 from "../../../assets/images/Tour/travel6.jpg";
import travel7 from "../../../assets/images/Tour/travel7.jpg";
import travel8 from "../../../assets/images/Tour/travel8.jpg";
import travel9 from "../../../assets/images/Tour/travel9.jpg";

const images = {
  1: travel1,
  2: travel2,
  3: travel3,
  4: travel4,
  5: travel5,
  6: travel6,
  7: travel7,
  8: travel8,
  9: travel9,
};

export default function TourCard({ tour }) {
  const navigate = useNavigate(); // ✅ hook điều hướng
  const imgSrc = images[tour.id] || travel1;

  // Hàm điều hướng tới trang chi tiết
  const handleReadMore = () => {
    navigate("/detailtours"); // đường dẫn tới DetailTour.jsx
  };

  return (
    <div className="bg-transparent rounded-2xl overflow-hidden w-[260px] hover:shadow-lg transition">
      {/* Ảnh cao hơn, hình chữ nhật, bo 4 góc */}
      <img
        src={imgSrc}
        alt={tour.title}
        className="w-full h-[280px] object-cover rounded-2xl"
      />

      {/* Nội dung */}
      <div className="p-4 text-left">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {tour.title}
        </h3>

        <p className="text-sm mt-1 mb-2 text-gray-800">
          from{" "}
          <span className="text-orange-500 font-bold text-[15px]">
            {tour.price} €
          </span>
        </p>

        <div className="flex justify-between text-xs text-gray-600 mb-3">
          <span>📅 {tour.schedule}</span>
          <span>👥 {tour.group}</span>
        </div>

        <p className="text-xs text-gray-700 mb-3 line-clamp-2">{tour.desc}</p>

        {/* Nút điều hướng */}
        <button
          onClick={handleReadMore}
          className="text-orange-500 text-xs font-semibold hover:text-orange-600"
        >
          Read More →
        </button>
      </div>
    </div>
  );
}
