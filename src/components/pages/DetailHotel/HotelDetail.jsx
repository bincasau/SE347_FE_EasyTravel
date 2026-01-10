import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHotelById, fetchHotelImages } from "@/apis/hotel";

const HOTEL_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

const IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

const HotelDetail = ({ hotelId }) => {
  const [hotel, setHotel] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Lấy dữ liệu khách sạn và ảnh
  useEffect(() => {
    if (!hotelId) return;

    const fetchData = async () => {
      try {
        const hotelData = await getHotelById(hotelId);
        const imageList = await fetchHotelImages(hotelId);

        setHotel(hotelData);

        // Gộp ảnh chính + 3 ảnh phụ vào chung 1 mảng
        const mergedImages = [
          {
            id: "main",
            url: `${HOTEL_IMAGE_BASE}/${hotelData.mainImage}`,
          },
          ...imageList.map((img) => ({
            id: img.imageId,
            url: `${IMAGE_BASE}/${img.url}`,
          })),
        ];

        setThumbnails(mergedImages);
        setActiveIndex(0);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu khách sạn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId]);

  if (loading) {
    return <div className="py-10 text-center">Đang tải dữ liệu...</div>;
  }

  if (!hotel) {
    return <div className="py-10 text-center">Không tìm thấy khách sạn</div>;
  }

  return (
    <div className="py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 border border-orange-500 text-orange-500 px-4 py-1.5 rounded-md hover:bg-orange-500 hover:text-white transition"
      >
        Trở về
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          {/* Slider ảnh lớn */}
          <div className="relative overflow-hidden rounded-2xl h-80 mb-4">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {thumbnails.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={hotel.name}
                  className="w-full h-full object-cover flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="grid grid-cols-4 gap-3">
            {thumbnails.map((img, index) => (
              <img
                key={img.id}
                src={img.url}
                alt="thumbnail"
                onClick={() => setActiveIndex(index)}
                className={`h-24 w-full object-cover rounded-xl cursor-pointer transition
                  ${
                    index === activeIndex
                      ? "ring-2 ring-orange-500"
                      : "hover:scale-105"
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-800">{hotel.name}</h1>
          <p className="text-gray-600">{hotel.address}</p>
          <p className="text-gray-700 leading-relaxed">{hotel.description}</p>

          <div className="text-lg">
            Điện thoại: <span className="font-medium">{hotel.phoneNumber}</span>
          </div>

          <div className="text-lg">
            Email: <span className="font-medium">{hotel.email}</span>
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
