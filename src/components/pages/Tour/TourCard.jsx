import React from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

// Ảnh fallback (nếu BE chưa trả URL ảnh đầy đủ)
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

  // Hỗ trợ cả 2 schema: FE model (id, price, ...) & BE JSON (tourId, priceAdult, ...)
  const id            = tour.id ?? tour.tourId;
  const title         = tour.title;
  const price         = tour.price ?? tour.priceAdult ?? 0;
  const percentOff    = tour.percent_discount ?? tour.percentDiscount ?? 0;
  const startDate     = tour.schedule ?? tour.start_date ?? tour.startDate ?? "";
  const destination   = tour.destination;
  const description   = tour.desc ?? tour.description ?? "";
  const mainImage     = tour.img ?? tour.mainImage ?? "";

  // Ảnh: ưu tiên ảnh BE nếu là URL tuyệt đối/đường dẫn; nếu không thì map theo id; cuối cùng là fallback
  const guessBackendImage = () => {
    if (typeof mainImage === "string" && mainImage.length > 0) {
      // nếu mainImage đã là URL tuyệt đối
      if (/^https?:\/\//i.test(mainImage)) return mainImage;
      // nếu BE chỉ trả tên file, thử gắn base uploads (tuỳ BE của bạn)
      return `http://localhost:8080/uploads/${mainImage}`;
    }
    return null;
  };
  const imgSrc = guessBackendImage() || images[id] || travel1;

  // Format tiền VND
  const formatCurrency = (val) =>
    Number(val ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // Giá sau giảm
  const discountedPrice =
    percentOff && Number(percentOff) > 0
      ? Number(price) - (Number(price) * Number(percentOff)) / 100
      : null;

  // ✅ Điều hướng đúng kèm id
  const handleClick = () => navigate(`/detailtour/${id}`);

  return (
    <div
      onClick={handleClick}
      className="bg-transparent rounded-2xl overflow-hidden w-[260px] hover:shadow-lg transition cursor-pointer group"
    >
      {/* Ảnh + ribbon giảm giá */}
      <div className="relative">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-[280px] object-cover rounded-2xl group-hover:scale-[1.03] transition-transform"
          onError={(e) => { e.currentTarget.src = travel1; }} // fallback nếu ảnh lỗi
        />

        {Number(percentOff) > 0 && (
          <>
            <div className="absolute top-3 left-0 bg-red-600 text-white text-[12px] font-bold px-3 py-1 rounded-r-md shadow-md">
              -{Number(percentOff)}%
            </div>
            <div className="absolute top-[28px] left-0 w-0 h-0 border-t-6 border-b-6 border-r-6 border-t-transparent border-b-transparent border-r-red-700" />
          </>
        )}
      </div>

      {/* Nội dung */}
      <div className="p-4 text-left">
        <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-orange-500 transition">
          {title}
        </h3>

        {/* Giá */}
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
          <span>📅 {startDate}</span>
          <span className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-orange-500" />
            {destination}
          </span>
        </div>

        <p className="text-xs text-gray-700 mb-3 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
