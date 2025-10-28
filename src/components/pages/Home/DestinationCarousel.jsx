import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/contexts/LangContext";

import dest1 from "@/assets/images/home/eiffel.png";
import dest2 from "@/assets/images/home/machu.png";
import dest3 from "@/assets/images/home/greatwall.png";
import dest4 from "@/assets/images/home/statue.png";
import dest5 from "@/assets/images/home/tajmahal.png";
import dest6 from "@/assets/images/home/opera.png";
import dest7 from "@/assets/images/home/colosseum.png";
import dest8 from "@/assets/images/home/grandcanyon.png";
import dest9 from "@/assets/images/home/angkor.png";
import dest10 from "@/assets/images/home/marina.png";

const destinations = [
  { id: 1, name: "Eiffel Tower", tours: 356, image: dest1 },
  { id: 2, name: "Machu Picchu", tours: 356, image: dest2 },
  { id: 3, name: "Great Wall", tours: 356, image: dest3 },
  { id: 4, name: "Statue of Liberty", tours: 356, image: dest4 },
  { id: 5, name: "Taj Mahal", tours: 356, image: dest5 },
  { id: 6, name: "Opera House", tours: 356, image: dest6 },
  { id: 7, name: "Colosseum", tours: 356, image: dest7 },
  { id: 8, name: "Grand Canyon", tours: 356, image: dest8 },
  { id: 9, name: "Angkor Wat", tours: 356, image: dest9 },
  { id: 10, name: "Marina Bay", tours: 356, image: dest10 },
];

const PopularDestinationCarousel = () => {
  const { t } = useLang();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 8;
  const [fade, setFade] = useState(true);

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + itemsPerPage) % destinations.length);
      setFade(true);
    }, 250);
  };

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const newIndex = prev - itemsPerPage;
        return newIndex < 0
          ? Math.floor((destinations.length - 1) / itemsPerPage) * itemsPerPage
          : newIndex;
      });
      setFade(true);
    }, 250);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const visibleDestinations = Array.from({ length: itemsPerPage }, (_, i) => {
    const index = (currentIndex + i) % destinations.length;
    return destinations[index];
  });

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-white font-poppins text-center">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
          {t("home.popularDestinations.title")}
        </h2>
        <p className="text-gray-500 mt-2">
          {t("home.popularDestinations.subtitle")}
        </p>
      </div>

      {/* Carousel */}
      <div className="relative flex items-center justify-center">
        {/* Nút Prev */}
        <button
          onClick={handlePrev}
          className="absolute left-0 md:-left-8 bg-gray-100 text-gray-600 p-3 rounded-full shadow hover:bg-gray-200 transition"
          aria-label="Previous destinations"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* Danh sách điểm đến */}
        <div
          className={`flex gap-8 overflow-hidden justify-center w-full transition-all duration-700 ${
            fade ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {visibleDestinations.map((dest) => (
            <div
              key={dest.id}
              className="flex flex-col items-center transform hover:scale-105 transition duration-500 ease-in-out"
            >
              <div className="w-[110px] h-[110px] rounded-full overflow-hidden shadow-md">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
              <h3 className="mt-4 font-medium text-gray-800">{dest.name}</h3>
              <p className="text-gray-500 text-sm">{dest.tours} Tours</p>
            </div>
          ))}
        </div>

        {/* Nút Next */}
        <button
          onClick={handleNext}
          className="absolute right-0 md:-right-8 bg-gray-100 text-gray-600 p-3 rounded-full shadow hover:bg-gray-200 transition"
          aria-label="Next destinations"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </section>
  );
};

export default PopularDestinationCarousel;
