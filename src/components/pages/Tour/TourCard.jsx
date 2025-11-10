import React from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

import travel1 from "../../../assets/images/Tour/travel1.jpg";
import travel2 from "../../../assets/images/Tour/travel2.jpg";
import travel3 from "../../../assets/images/Tour/travel3.jpg";
import travel4 from "../../../assets/images/Tour/travel4.jpg";
import travel5 from "../../../assets/images/Tour/travel5.jpg";
import travel6 from "../../../assets/images/Tour/travel6.jpg";
import travel7 from "../../../assets/images/Tour/travel7.jpg";
import travel8 from "../../../assets/images/Tour/travel8.jpg";
import travel9 from "../../../assets/images/Tour/travel9.jpg";

const images = { 1: travel1, 2: travel2, 3: travel3, 4: travel4, 5: travel5, 6: travel6, 7: travel7, 8: travel8, 9: travel9 };

export default function TourCard({ tour }) {
  const navigate = useNavigate();
  const imgSrc = images[tour.id] || tour.img || travel1;

  const discountedPrice =
    tour.percent_discount && tour.percent_discount > 0
      ? (tour.price - (tour.price * tour.percent_discount) / 100).toFixed(2)
      : null;

  const handleClick = () => navigate("/detailtours");

  return (
    <div
      onClick={handleClick}
      className="bg-transparent rounded-2xl overflow-hidden w-[260px] hover:shadow-lg transition cursor-pointer group"
    >
      {/* Ảnh + ribbon giảm giá */}
      <div className="relative">
        <img
          src={imgSrc}
          alt={tour.title}
          className="w-full h-[280px] object-cover rounded-2xl group-hover:scale-[1.03] transition-transform"
        />

        {/* 🏷 Ribbon kiểu banner, giữ nguyên phần trăm */}
        {tour.percent_discount > 0 && (
          <>
            <div className="absolute top-3 left-0 bg-red-600 text-white text-[12px] font-bold px-3 py-1 rounded-r-md shadow-md">
              -{tour.percent_discount}%
            </div>
            {/* đuôi tam giác (gấp giấy) */}
            <div className="absolute top-[28px] left-0 w-0 h-0 
                            border-t-6 border-b-6 border-r-6 
                            border-t-transparent border-b-transparent border-r-red-700" />
          </>
        )}
      </div>

      {/* Nội dung */}
      <div className="p-4 text-left">
        <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-orange-500 transition">
          {tour.title}
        </h3>

        <p className="text-sm mt-1 mb-2 text-gray-800">
          from{" "}
          {discountedPrice ? (
            <>
              <span className="text-gray-400 line-through mr-2">{tour.price} €</span>
              <span className="text-orange-500 font-bold text-[15px]">{discountedPrice} €</span>
            </>
          ) : (
            <span className="text-orange-500 font-bold text-[15px]">{tour.price} €</span>
          )}
        </p>

        <div className="flex justify-between text-xs text-gray-600 mb-3">
          <span>📅 {tour.schedule || tour.start_date}</span>
          <span className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-orange-500" />
            {tour.destination}
          </span>
        </div>

        <p className="text-xs text-gray-700 mb-3 line-clamp-2">{tour.desc}</p>
      </div>
    </div>
  );
}
