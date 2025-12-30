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
  imagesHref, // optional (nếu bạn có HAL link thì truyền vào)
}) => {
  const { t } = useLang();
  const [searchParams] = useSearchParams();

  //  default: theo hotel_id (đúng như link bạn đưa)
  const [imageUrl, setImageUrl] = useState(
    hotel_id != null ? `${S3_HOTEL_BASE}/hotel_${hotel_id}.jpg` : null
  );
  const [triedFetchFallback, setTriedFetchFallback] = useState(false);

  const handleSavePage = () => {
    const currentPage = searchParams.get("page") || 1;
    sessionStorage.setItem("hotelPrevPage", currentPage);
  };

  //  Khi hotel_id đổi, reset ảnh về theo hotel_id
  useEffect(() => {
    setImageUrl(hotel_id != null ? `${S3_HOTEL_BASE}/hotel_${hotel_id}.jpg` : null);
    setTriedFetchFallback(false);
  }, [hotel_id]);

  //  fallback kiểu tour: fetch images -> lấy imageId -> build S3 hotel_<imageId>.jpg
  const fetchFallbackImage = async () => {
    if (!hotel_id) return;
    if (triedFetchFallback) return;
    setTriedFetchFallback(true);

    try {
      const endpoint = imagesHref || `http://localhost:8080/hotels/${hotel_id}/images`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch hotel images");
      const data = await res.json();

      const list =
        data?._embedded?.images ||
        data?.images ||
        (Array.isArray(data) ? data : []) ||
        [];

      const first = list[0];
      const imgId = first?.imageId ?? first?.id;
      if (imgId != null) {
        setImageUrl(`${S3_HOTEL_BASE}/hotel_${imgId}.jpg`);
      } else {
        setImageUrl("/images/hotel/fallback.jpg");
      }
    } catch (e) {
      console.error("Lỗi fallback fetch hotel images:", e);
      setImageUrl("/images/hotel/fallback.jpg");
    }
  };

  return (
    <Link
      to={`/hotel/${hotel_id}`}
      onClick={handleSavePage}
      className="block w-72"
    >
      <div
        className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col 
  hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        <img
          src={imageUrl || "/images/hotel/fallback.jpg"}
          alt={name}
          className="w-full h-56 object-cover rounded-t-2xl"
          onError={fetchFallbackImage}
        />

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>

          <p className="text-sm text-gray-500 mb-2">
            {t("hotelPage.only")}{" "}
            <span className="text-orange-500 font-bold text-base">
              {formatPrice(price, "VND")} VNĐ / {t("hotelPage.night")}
            </span>
          </p>

          <p className="text-sm text-orange-500 mb-1 flex items-center gap-2">
            <FontAwesomeIcon icon={faPhone} />
            {t("hotelPage.hotline")}: {hotline}
          </p>

          <p className="text-sm text-gray-500 mb-3 min-h-[40px]">{address}</p>

          <p className="text-sm text-gray-600 flex-grow">
            {description || "Hiện chưa có mô tả."}
          </p>

          <span className="mt-4 text-orange-500 font-semibold text-sm">
            {t("hotelPage.bookNow")} →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
