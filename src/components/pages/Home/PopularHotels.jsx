import React, { useEffect, useState } from "react";
import HotelCard from "@/components/pages/Hotel/HotelCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/contexts/LangContext";

const PopularHotels = () => {
  const { t } = useLang();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  // 🔥 Fetch hotels from backend
  useEffect(() => {
    fetch("http://localhost:8080/hotels")
      .then((res) => res.json())
      .then((data) => {
        const list = data?._embedded?.hotels || [];
        const limited = list.slice(0, 8); // ⭐ Chỉ lấy 8 khách sạn
        setHotels(limited);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách khách sạn:", err);
        setError("Không thể tải dữ liệu khách sạn.");
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + itemsPerPage) % hotels.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - itemsPerPage;
      return newIndex < 0
        ? Math.floor((hotels.length - 1) / itemsPerPage) * itemsPerPage
        : newIndex;
    });
  };

  const visibleHotels = Array.from({ length: itemsPerPage }, (_, i) => {
    const index = (currentIndex + i) % hotels.length;
    return hotels[index];
  });

  if (loading) return <div className="text-center py-10">Đang tải...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-white font-poppins">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {t("home.popularHotels.title") || "The Most Popular Hotels"}
        </h2>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full border bg-orange-100 text-orange-500 hover:bg-orange-200 transition"
            aria-label="Previous hotels"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-full border bg-orange-500 text-white hover:bg-orange-600 transition"
            aria-label="Next hotels"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
        {visibleHotels.map((h) => (
          <HotelCard
            key={h.hotelId}
            hotel_id={h.hotelId}
            name={h.name}
            address={h.address}
            hotline={h.phoneNumber}
            description={h.description}
            image={h.mainImage}
            price={h.minPrice}
          />
        ))}
      </div>
    </section>
  );
};

export default PopularHotels;
