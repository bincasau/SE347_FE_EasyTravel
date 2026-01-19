import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaCalendarDay } from "react-icons/fa";

export default function Itineraries({ tourId }) {
  const [itineraries, setItineraries] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  const colorThemes = [
    "bg-orange-50 border-orange-200",
    "bg-blue-50 border-blue-200",
    "bg-green-50 border-green-200",
    "bg-pink-50 border-pink-200",
    "bg-yellow-50 border-yellow-200",
  ];

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${tourId}/itineraries`);
        if (!res.ok) throw new Error("Failed to fetch itineraries");
        const data = await res.json();

        const items =
          data?._embedded?.itineraries ||
          data?.itineraries ||
          (Array.isArray(data) ? data : []) ||
          [];

        const normalized = items.map((i, index) => {
          const raw = (i.activities ?? "").toString();
          const lines = raw
            .split(".")
            .map((s) => s.trim())
            .filter(Boolean);

          return {
            id: i.itinerary_id || i.id || index,
            title: i.title?.trim() || `Day ${i.day_number || index + 1}`,
            lines,
          };
        });

        setItineraries(normalized);
      } catch (err) {
        console.error("❌ Error fetching itineraries:", err);
        setItineraries([]);
      }
    };

    if (tourId) fetchItineraries();
  }, [tourId]);

  const toggleCard = (index) =>
    setOpenIndex((prev) => (prev === index ? null : index));

  const splitIntoTwoColumns = (arr) => {
    const mid = Math.ceil(arr.length / 2);
    return [arr.slice(0, mid), arr.slice(mid)];
  };

  if (!itineraries.length)
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-gray-500">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Itineraries
        </h2>
        <p>No itinerary available for this tour.</p>
      </section>
    );

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <h2 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-6 sm:mb-8">
        Itineraries
      </h2>

      <div className="flex flex-col gap-4 sm:gap-5">
        {itineraries.map((item, index) => {
          const isOpen = openIndex === index;
          const theme = colorThemes[index % colorThemes.length];
          const [col1, col2] = splitIntoTwoColumns(item.lines);

          return (
            <div
              key={item.id}
              className={[
                "w-full",
                "mx-auto",
                "rounded-xl border",
                theme,
                "shadow-sm hover:shadow-md transition-all overflow-hidden",
              ].join(" ")}
            >
              {/* Header */}
              <button
                onClick={() => toggleCard(index)}
                className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 text-left"
                type="button"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="bg-orange-500 text-white rounded-full p-2 shadow-sm shrink-0">
                    <FaCalendarDay className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 truncate">
                    {item.title}
                  </h3>
                </div>

                <span className="shrink-0">
                  {isOpen ? (
                    <FaChevronUp className="text-orange-500" />
                  ) : (
                    <FaChevronDown className="text-orange-500" />
                  )}
                </span>
              </button>

              {/* Content */}
              <div
                className={[
                  "transition-all duration-300 overflow-hidden",
                  isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
                ].join(" ")}
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                  <div className="mt-2 sm:mt-3">
                    {item.lines.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-10 gap-y-3 sm:gap-y-4">
                        {/* Col 1 */}
                        <div className="flex flex-col gap-2">
                          {col1.map((line, i) => (
                            <p
                              key={i}
                              className="text-gray-700 text-sm sm:text-[15px] leading-relaxed break-words"
                            >
                              {line}.
                            </p>
                          ))}
                        </div>

                        {/* Col 2 */}
                        <div className="flex flex-col gap-2">
                          {col2.map((line, i) => (
                            <p
                              key={i}
                              className="text-gray-700 text-sm sm:text-[15px] leading-relaxed break-words"
                            >
                              {line}.
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No details.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
