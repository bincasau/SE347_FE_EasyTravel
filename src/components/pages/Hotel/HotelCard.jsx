import React, { useEffect, useState } from "react";
import { useLang } from "@/contexts/LangContext";
import { Link, useLocation } from "react-router-dom";
import { formatPrice } from "@/utils/formatPrice";
import { buildTourSlug } from "@/utils/slug";

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
  const location = useLocation();

  const [imageUrl, setImageUrl] = useState(
    hotel_id != null ? `${S3_HOTEL_BASE}/hotel_${hotel_id}.jpg` : null
  );

  useEffect(() => {
    setImageUrl(
      hotel_id != null ? `${S3_HOTEL_BASE}/hotel_${hotel_id}.jpg` : null
    );
  }, [hotel_id]);

  const slugId = buildTourSlug(hotel_id, name);

  return (
    <Link
      to={`/detailhotel/${slugId}`}
      state={{ from: location.pathname + location.search }}
      className="block w-full"
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-44 sm:h-52 lg:h-56 object-cover"
          loading="lazy"
        />

        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[40px] sm:min-h-[48px]">
            {name}
          </h3>

          <p className="text-sm text-gray-500 mb-2">
            {t("hotelPage.only")}{" "}
            <span className="text-orange-500 font-bold text-sm sm:text-base">
              {formatPrice(price, "VND")} VNĐ / {t("hotelPage.night")}
            </span>
          </p>

          <p className="text-sm text-orange-500 mb-1 flex items-center gap-2">
            {t("hotelPage.hotline")}: {hotline}
          </p>

          <p className="text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-2 min-h-[36px] sm:min-h-[40px]">
            {address}
          </p>

          <p className="text-sm text-gray-600 flex-1 line-clamp-2 min-h-[44px] sm:min-h-[48px]">
            {description || "Hiện chưa có mô tả."}
          </p>

          <span className="mt-3 sm:mt-4 text-orange-500 font-semibold text-sm">
            {t("hotelPage.bookNow")} →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
