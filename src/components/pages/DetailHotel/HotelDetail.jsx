import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const HOTEL_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

const IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

const HotelDetail = ({ hotelId }) => {
  const [hotel, setHotel] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!hotelId) return;

    const fetchData = async () => {
      try {
        // 1️⃣ Fetch hotel detail
        const hotelRes = await fetch(`http://localhost:8080/hotels/${hotelId}`);
        const hotelData = await hotelRes.json();
        setHotel(hotelData);

        // 2️⃣ Fetch hotel images
        const imgRes = await fetch(
          `http://localhost:8080/hotels/${hotelId}/images`
        );
        const imgData = await imgRes.json();

        const list = imgData?._embedded?.images || [];
        setImages(list);
      } catch (error) {
        console.error("Fetch hotel detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId]);

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="py-10 text-center">Đang tải thông tin khách sạn...</div>
    );
  }

  // ===== NOT FOUND =====
  if (!hotel) {
    return <div className="py-10 text-center">Không tìm thấy khách sạn</div>;
  }

  return (
    <div className="py-10">
      {/* ===== BACK BUTTON ===== */}
      <button
        onClick={handleBack}
        className="mb-6 flex items-center gap-2 border border-orange-500 
        text-orange-500 px-4 py-1.5 rounded-md 
        hover:bg-orange-500 hover:text-white transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Trở về
      </button>

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ===== LEFT: IMAGES ===== */}
        <div>
          {/* Ảnh chính */}
          <img
            src={`${HOTEL_IMAGE_BASE}/${hotel.mainImage}`}
            alt={hotel.name}
            className="w-full h-80 object-cover rounded-2xl mb-4"
          />

          {/* Ảnh phụ */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <img
                  key={img.imageId}
                  src={`${IMAGE_BASE}/${img.url}`}
                  alt={img.altText || "Hotel image"}
                  className="h-32 w-full object-cover rounded-xl hover:scale-105 transition"
                />
              ))}
            </div>
          )}
        </div>

        {/* ===== RIGHT: INFO ===== */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-800">{hotel.name}</h1>

          <p className="text-gray-600">{hotel.address}</p>

          <p className="text-gray-700 leading-relaxed">{hotel.description}</p>

          <div className="text-lg">
            📞 <span className="font-medium">{hotel.phoneNumber}</span>
          </div>

          <div className="text-lg">
            📧 <span className="font-medium">{hotel.email}</span>
          </div>

          <div className="mt-4 text-2xl font-bold text-orange-500">
            {hotel.minPrice?.toLocaleString("vi-VN")}₫ / đêm
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
