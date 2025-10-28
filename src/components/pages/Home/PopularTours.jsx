import React, { useState } from "react";
import TourCard from "../Tour/TourCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import tours from "@/data/tour.json";
import { useLang } from "@/contexts/LangContext";

const PopularTours = () => {
  const { t } = useLang();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

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
