import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/contexts/LangContext";
import { Link, useSearchParams } from "react-router-dom";
import { formatPrice } from "@/utils/formatPrice";

const S3_HOTEL_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

const HotelCard = ({
  hotel_id,
  name,
  price,
  hotline,
  address,
  description,
}) => {
  const { t } = useLang();
  const [searchParams] = useSearchParams();

  //  default: theo hotel_id 
  const [imageUrl, setImageUrl] = useState(
    hotel_id != null ? `${S3_HOTEL_BASE}/hotel_${hotel_id}.jpg` : null
  );

  const handleSavePage = () => {
    const currentPage = searchParams.get("page") || 1;
    sessionStorage.setItem("hotelPrevPage", currentPage);
  };

  //  Khi hotel_id đổi, reset ảnh về theo hotel_id
  useEffect(() => {
    setImageUrl(hotel_id != null ? `${S3_HOTEL_BASE}/hotel_${hotel_id}.jpg` : null);
  }, [hotel_id]);


  return (
    <Link
      to={`/detailhotel/${hotel_id}`}
      onClick={handleSavePage}
      className="block w-72"
    >
      <div
        className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col 
  hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-56 object-cover rounded-t-2xl"
        />

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 min-h-[56px]">
            {name}
          </h3>

          <p className="text-sm text-gray-500 mb-2">
            {t("hotelPage.only")}{" "}
            <span className="text-orange-500 font-bold text-base">
              {formatPrice(price, "VND")} VNĐ / {t("hotelPage.night")}
            </span>
          </p>

          <p className="text-sm text-orange-500 mb-1 flex items-center gap-2">
            {t("hotelPage.hotline")}: {hotline}
          </p>

          <p className="text-sm text-gray-500 mb-3 min-h-[40px]">{address}</p>

          <p className="text-sm text-gray-600 flex-grow line-clamp-2 min-h-[48px]">
            {description || "Hiện chưa có mô tả."}
          </p>

          <span className="mt-auto text-orange-500 font-semibold text-sm">
            {t("hotelPage.bookNow")} →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
