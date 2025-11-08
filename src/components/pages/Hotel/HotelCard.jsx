import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/contexts/LangContext";
import { Link } from "react-router-dom";
import { formatPrice } from "@/utils/formatPrice";

const HotelCard = ({
  hotel_id,
  image,
  name,
  price,
  hotline,
  address,
  description,
}) => {
  const { t } = useLang();

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden w-72 flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Hình ảnh */}
      <img
        src={`/images/hotel/${image}`}
        alt={name}
        className="w-full h-56 object-cover rounded-t-2xl"
      />

      {/* Nội dung */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Tên khách sạn */}
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>

        {/* Giá */}
        <p className="text-sm text-gray-500 mb-2">
          {t("hotelPage.only")}{" "}
          <span className="text-orange-500 font-bold text-base">
            {formatPrice(price, "VND")} VNĐ/ {t("hotelPage.night")}
          </span>
        </p>

        {/* Hotline */}
        <p className="text-sm text-orange-500 mb-1 flex items-center gap-2">
          <FontAwesomeIcon icon={faPhone} />
          {t("hotelPage.hotline")}: {hotline}
        </p>

        {/* Địa chỉ */}
        <p className="text-sm text-gray-500 mb-3">{address}</p>

        {/* Mô tả */}
        <p className="text-sm text-gray-600 flex-grow">{description}</p>

        {/* Nút đặt → chuyển sang trang RoomList */}
        <Link
          to={`/hotel/${hotel_id}`}
          className="mt-4 text-orange-500 font-semibold text-sm hover:underline flex items-center gap-1"
        >
          {t("hotelPage.bookNow")} <span>→</span>
        </Link>
      </div>
    </div>
  );
};

export default HotelCard;
