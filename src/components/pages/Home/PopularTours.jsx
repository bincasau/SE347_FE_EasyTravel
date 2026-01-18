import React, { useEffect, useMemo, useState } from "react";
import TourCard from "../Tour/TourCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { getPopularTours } from "@/apis/Home";
import { useLang } from "@/contexts/LangContext";

const PopularTours = () => {
  const { t } = useLang();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    let isMounted = true;

    const fetchTours = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getPopularTours();
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        if (!isMounted) return;

        setTours(list);
        setCurrentIndex(0);
      } catch (err) {
        console.error("getPopularTours error:", err);
        if (!isMounted) return;
        setError("Không thể tải danh sách tour.");
        setTours([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchTours();

    return () => {
      isMounted = false;
    };
  }, []);

  const canNavigate = tours.length > 0;

  const handleNext = () => {
    if (!canNavigate) return;
    setCurrentIndex((prev) => (prev + itemsPerPage) % tours.length);
  };

  const handlePrev = () => {
    if (!canNavigate) return;
    setCurrentIndex((prev) => {
      const newIndex = prev - itemsPerPage;
      return newIndex < 0
        ? Math.floor((tours.length - 1) / itemsPerPage) * itemsPerPage
        : newIndex;
    });
  };

  const visibleTours = useMemo(() => {
    if (!Array.isArray(tours) || tours.length === 0) return [];
    return Array.from(
      { length: Math.min(itemsPerPage, tours.length) },
      (_, i) => {
        const index = (currentIndex + i) % tours.length;
        return tours[index];
      },
    ).filter(Boolean);
  }, [tours, currentIndex]);

  if (loading) return <div className="text-center py-10">Đang tải tour...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!Array.isArray(tours) || tours.length === 0)
    return <div className="text-center py-10">Chưa có tour phổ biến.</div>;

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20 bg-white font-poppins">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {t("home.popularTours.title")}
        </h2>

        <div className="flex items-center gap-3 justify-center sm:justify-end">
          <button
            onClick={handlePrev}
            disabled={!canNavigate}
            className={`p-2 rounded-full border transition ${
              canNavigate
                ? "bg-orange-100 text-orange-500 hover:bg-orange-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Previous tours"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <button
            onClick={handleNext}
            disabled={!canNavigate}
            className={`p-2 rounded-full border transition ${
              canNavigate
                ? "bg-orange-100 text-orange-500 hover:bg-orange-200"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Next tours"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
        {visibleTours.map((tour, idx) => (
          <TourCard
            key={tour?.id ?? tour?.tour_id ?? `${currentIndex}-${idx}`}
            tour={tour}
          />
        ))}
      </div>
    </section>
  );
};

export default PopularTours;
