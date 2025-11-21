import React, { useEffect, useState } from "react";
import TourCard from "../Tour/TourCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/contexts/LangContext";

const PopularTours = () => {
  const { t } = useLang();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  // 🔥 Fetch Tours
  useEffect(() => {
    fetch("http://localhost:8080/tours")
      .then((res) => res.json())
      .then((data) => {
        const list = data?._embedded?.tours || [];

        // ⭐ Lấy 8 tour đầu tiên
        const limited = list.slice(0, 8);

        const mapped = limited.map((t) => ({
          id: t.tourId, // Backend dùng tourId
          tourId: t.tourId,
          title: t.title,
          priceAdult: t.priceAdult || 0,
          percentDiscount: t.percentDiscount || 0,
          startDate: t.startDate,
          destination: t.destination,
          description: t.shortDescription || t.description,
          mainImage: t.mainImage, // Nếu TourCard fallback vẫn chạy
          imagesHref: t._links?.images?.href || null,
        }));

        setTours(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải tour:", err);
        setError("Không thể tải danh sách tour.");
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + itemsPerPage) % tours.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - itemsPerPage;
      return newIndex < 0
        ? Math.floor((tours.length - 1) / itemsPerPage) * itemsPerPage
        : newIndex;
    });
  };

  const visibleTours = Array.from({ length: itemsPerPage }, (_, i) => {
    const index = (currentIndex + i) % tours.length;
    return tours[index];
  });

  if (loading) return <div className="text-center py-10">Đang tải tour...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-white font-poppins">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {t("home.popularTours.title")}
        </h2>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full border bg-orange-100 text-orange-500 hover:bg-orange-200 transition"
            aria-label="Previous tours"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-full border bg-orange-500 text-white hover:bg-orange-600 transition"
            aria-label="Next tours"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      {/* Tour list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
        {visibleTours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </section>
  );
};

export default PopularTours;
