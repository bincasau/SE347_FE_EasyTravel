import React from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function TourCard({ tour }) {
  const navigate = useNavigate();

  const id = tour.id ?? tour.tourId;
  const title = tour.title;
  const price = tour.priceAdult ?? 0;
  const percentDiscount = tour.percentDiscount ?? 0;
  const startDate = tour.startDate ?? "";
  const destination = tour.destination;
  const description = tour.description ?? "";

  // ✅ AWS S3: mỗi tour 1 ảnh theo id
  const S3_BASE =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/tour";
  const s3ImageUrl = id != null ? `${S3_BASE}/tour_${id}.jpg` : "";

  const formatCurrency = (val) =>
    Number(val ?? 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const discountedPrice =
    percentDiscount && Number(percentDiscount) > 0
      ? Number(price) - (Number(price) * Number(percentDiscount)) / 100
      : null;

  const handleClick = () => navigate(`/detailtour/${id}`);

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden w-[260px] hover:shadow-lg transition cursor-pointer group"
    >
      <div className="relative">
        <img
          src={s3ImageUrl}
          alt={title}
          className="w-full h-[280px] object-cover rounded-2xl group-hover:scale-[1.03] transition-transform"
          onError={(e) => {
            // ✅ fallback nếu thiếu ảnh trên S3
            e.currentTarget.src = "/images/tour/fallback.jpg";
          }}
        />

        {Number(percentDiscount) > 0 && (
          <>
            <div className="absolute top-3 left-0 bg-red-600 text-white text-[12px] font-bold px-3 py-1 rounded-r-md shadow-md">
              -{Number(percentDiscount)}%
            </div>
            <div className="absolute top-[28px] left-0 w-0 h-0 border-t-6 border-b-6 border-r-6 border-t-transparent border-b-transparent border-r-red-700" />
          </>
        )}
      </div>

      <div className="p-4 text-left">
        <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-orange-500 transition">
          {title}
        </h3>

        <div className="mt-2 mb-3">
          {discountedPrice ? (
            <div className="flex flex-col">
              <span className="text-gray-400 line-through text-sm">
                {formatCurrency(price)}
              </span>
              <span className="text-orange-500 font-bold text-lg">
                {formatCurrency(discountedPrice)}
              </span>
            </div>
          ) : (
            <span className="text-orange-500 font-bold text-lg">
              {formatCurrency(price)}
            </span>
          )}
        </div>

        <div className="flex justify-between text-xs text-gray-600 mb-3">
          <span>📅 {startDate || "Đang cập nhật"}</span>
          <span className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-orange-500" />
            {destination || "Chưa có"}
          </span>
        </div>

        <p className="text-xs text-gray-700 mb-3 line-clamp-2">
          {description || "Hiện chưa có mô tả cho tour này."}
        </p>
      </div>
    </div>
  );
}
