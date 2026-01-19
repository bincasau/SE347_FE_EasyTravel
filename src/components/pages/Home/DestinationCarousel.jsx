import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/contexts/LangContext";

import dest1 from "@/assets/images/home/cantho.jpg";
import dest2 from "@/assets/images/home/dalat.jpg";
import dest3 from "@/assets/images/home/halong.jpg";
import dest4 from "@/assets/images/home/hoian.jpg";
import dest5 from "@/assets/images/home/hue.jpg";
import dest6 from "@/assets/images/home/muine.jpg";
import dest7 from "@/assets/images/home/nguhanhson.jpg";
import dest8 from "@/assets/images/home/phuquoc.jpg";
import dest9 from "@/assets/images/home/quynhon.jpg";
import dest10 from "@/assets/images/home/sapa.jpg";

const destinations = [
  { id: 1, name: "Cần Thơ", image: dest1 },
  { id: 2, name: "Đà Lạt", image: dest2 },
  { id: 3, name: "Hạ Long", image: dest3 },
  { id: 4, name: "Hội An", image: dest4 },
  { id: 5, name: "Huế", image: dest5 },
  { id: 6, name: "Mũi Né", image: dest6 },
  { id: 7, name: "Ngũ Hành Sơn", image: dest7 },
  { id: 8, name: "Phú Quốc", image: dest8 },
  { id: 9, name: "Quy Nhơn", image: dest9 },
  { id: 10, name: "Sapa", image: dest10 },
];

const getItemsPerPage = () => {
  if (typeof window === "undefined") return 8;
  const w = window.innerWidth;
  if (w < 640) return 3; // mobile
  if (w < 1024) return 5; // tablet
  return 8; // desktop
};

const PopularDestinationCarousel = () => {
  const { t } = useLang();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + itemsPerPage) % destinations.length);
      setFade(true);
    }, 220);
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
    }, 220);
  };

  useEffect(() => {
    const onResize = () => {
      const next = getItemsPerPage();
      setItemsPerPage((prev) => {
        if (prev !== next) {
          setCurrentIndex(0);
          return next;
        }
        return prev;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => handleNext(), 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPerPage]);

  const visibleDestinations = useMemo(() => {
    return Array.from({ length: itemsPerPage }, (_, i) => {
      const index = (currentIndex + i) % destinations.length;
      return destinations[index];
    });
  }, [currentIndex, itemsPerPage]);

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20 bg-white font-poppins text-center">
      <div className="mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
          {t("home.popularDestinations.title")}
        </h2>
      </div>

      <div className="relative flex items-center justify-center">
        <button
          onClick={handlePrev}
          className="absolute -left-2 sm:left-0 md:-left-8 bg-gray-100 text-gray-600 p-3 rounded-full shadow hover:bg-gray-200 transition z-10"
          aria-label="Previous destinations"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <div className="w-full overflow-hidden px-6 sm:px-10">
          <div
            className={`flex gap-6 sm:gap-8 justify-center w-full transition-all duration-700 ${
              fade ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {visibleDestinations.map((dest) => (
              <div
                key={dest.id}
                className="flex flex-col items-center transform hover:scale-105 transition duration-500 ease-in-out shrink-0"
              >
                <div className="w-[92px] h-[92px] sm:w-[110px] sm:h-[110px] rounded-full overflow-hidden shadow-md">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </div>
                <h3 className="mt-3 sm:mt-4 font-medium text-gray-800 text-sm sm:text-base">
                  {dest.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          className="absolute -right-2 sm:right-0 md:-right-8 bg-gray-100 text-gray-600 p-3 rounded-full shadow hover:bg-gray-200 transition z-10"
          aria-label="Next destinations"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </section>
  );
};

export default PopularDestinationCarousel;
