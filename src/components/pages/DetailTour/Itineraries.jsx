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
        const res = await fetch(
          `http://localhost:8080/tours/${tourId}/itineraries`,
        );
        if (!res.ok) throw new Error("Failed to fetch itineraries");
        const data = await res.json();

        const items =
          data?._embedded?.itineraries ||
          data?.itineraries ||
          (Array.isArray(data) ? data : []) ||
          [];

        const normalized = items.map((i, index) => {
          const raw = (i.activities ?? "").toString();

          // ✅ tách theo dấu chấm, gom thành list câu
          const lines = raw
            .split(".")
            .map((s) => s.trim())
            .filter(Boolean);

          return {
            id: i.itinerary_id || i.id || index,
            title: i.title?.trim() || `Day ${i.day_number || index + 1}`,
            lines, // ✅ mảng câu
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

  // ✅ helper: chia list thành 2 cột (nửa đầu / nửa sau)
  const splitIntoTwoColumns = (arr) => {
    const mid = Math.ceil(arr.length / 2);
    return [arr.slice(0, mid), arr.slice(mid)];
  };

  if (!itineraries.length)
    return (
      <section className="max-w-6xl mx-auto px-6 py-10 text-gray-500">
        <h2 className="text-5xl font-semibold text-gray-800 mb-6">
          Itineraries
        </h2>
        <p>No itinerary available for this tour.</p>
      </section>
    );

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-4xl font-semibold text-gray-800 mb-8">Itineraries</h2>

      <div className="flex flex-col gap-5 pr-2">
        {itineraries.map((item, index) => {
          const isOpen = openIndex === index;
          const theme = colorThemes[index % colorThemes.length];

          const [col1, col2] = splitIntoTwoColumns(item.lines);

          return (
            <div
              key={item.id}
              className={`rounded-xl border ${theme} shadow-sm hover:shadow-md transition-all overflow-hidden w-full max-w-3xl mr-2`}
            >
              {/* Header */}
              <button
                onClick={() => toggleCard(index)}
                className="flex justify-between items-center w-full p-3 text-left"
                type="button"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-orange-500 text-white rounded-full p-2 shadow-sm">
                    <FaCalendarDay size={18} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 truncate">
                    {item.title}
                  </h3>
                </div>

                {isOpen ? (
                  <FaChevronUp className="text-orange-500 shrink-0" />
                ) : (
                  <FaChevronDown className="text-orange-500 shrink-0" />
                )}
              </button>

              {/* ✅ Nội dung: 2 cột, mỗi cột list dọc */}
              <div
                className={`px-6 pb-5 transition-all duration-300 overflow-hidden ${
                  isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-3">
                  {item.lines.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                      {/* Cột 1 */}
                      <div className="flex flex-col gap-2">
                        {col1.map((line, i) => (
                          <p
                            key={i}
                            className="text-gray-700 text-sm leading-relaxed"
                          >
                            {line}.
                          </p>
                        ))}
                      </div>

                      {/* Cột 2 */}
                      <div className="flex flex-col gap-2">
                        {col2.map((line, i) => (
                          <p
                            key={i}
                            className="text-gray-700 text-sm leading-relaxed"
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
          );
        })}
      </div>
    </section>
  );
}
