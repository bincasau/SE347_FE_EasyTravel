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

        console.log("✅ Raw itineraries:", data);

        const items = data._embedded?.itineraries || data.itineraries || data || [];

        const normalized = items.map((i, index) => ({
          id: i.itinerary_id || i.id || index,
          title:
            i.title?.trim() ||
            `Day ${i.day_number || index + 1}`,
          activities: i.activities || "",
          dayNumber: i.day_number || i.dayNumber || index + 1,
        }));

        setItineraries(normalized);
      } catch (err) {
        console.error("❌ Error fetching itineraries:", err);
      }
    };

    fetchItineraries();
  }, [tourId]);

  const toggleCard = (index) => setOpenIndex((prev) => (prev === index ? null : index));

  const parseActivities = (activities) => {
    const lines = activities.split("\n").filter((l) => l.trim() !== "");
    return lines.map((line) => {
      const timeMatch = line.match(/^(\d{1,2}[:.]\d{2})/);
      const time = timeMatch ? timeMatch[1] : "";
      const text = time ? line.replace(time, "").trim() : line.trim();
      const hour = parseInt(time.split(":")[0]);
      return { time, text, hour: !isNaN(hour) ? hour : null };
    });
  };

  if (!itineraries.length)
    return (
      <section className="max-w-6xl mx-auto px-6 py-10 text-gray-500">
        <h2 className="text-5xl font-podcast text-gray-800 mb-6">
          Itineraries
        </h2>
        <p>No itinerary available for this tour.</p>
      </section>
    );

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      {/* ✅ Giữ font-podcast, bỏ font-semibold */}
      <h2 className="text-4xl font-podcast text-gray-800 mb-8">
        Itineraries
      </h2>

      <div className="flex flex-col gap-5">
        {itineraries.map((item, index) => {
          const isOpen = openIndex === index;
          const theme = colorThemes[index % colorThemes.length];
          const parsed = parseActivities(item.activities);

          const morning = parsed.filter((a) => a.hour >= 5 && a.hour < 12);
          const afternoon = parsed.filter((a) => a.hour >= 12 && a.hour < 18);
          const evening = parsed.filter((a) => a.hour >= 18);

          return (
            <div
              key={item.id}
              className={`rounded-xl border ${theme} shadow-sm hover:shadow-md transition-all overflow-hidden w-fit`}
            >
              {/* Header */}
              <button
                onClick={() => toggleCard(index)}
                className="flex justify-between items-center w-full p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 text-white rounded-full p-2 shadow-sm">
                    <FaCalendarDay size={18} />
                  </div>
                  {/* ✅ Giữ font-podcast, không dùng semibold */}
                  <h3 className="text-2xl font-podcast text-gray-800">
                    {item.title}
                  </h3>
                </div>
                {isOpen ? (
                  <FaChevronUp className="text-orange-500" />
                ) : (
                  <FaChevronDown className="text-orange-500" />
                )}
              </button>

              {/* Nội dung */}
              <div
                className={`px-6 pb-5 transition-all duration-300 overflow-hidden ${
                  isOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-3 grid sm:grid-cols-2 gap-x-10 gap-y-3">
                  {/* Morning */}
                  <div>
                    {morning.length > 0 && (
                      <>
                        <p className="text-xs text-gray-500 uppercase mb-1">
                          Morning
                        </p>
                        <div className="flex flex-col gap-2">
                          {morning.map((a, i) => (
                            <div key={i} className="flex items-start gap-3">
                              {a.time && (
                                <span className="font-bold text-orange-500 min-w-[50px] text-right">
                                  {a.time}
                                </span>
                              )}
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {a.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Afternoon + Evening */}
                  <div>
                    {(afternoon.length > 0 || evening.length > 0) && (
                      <>
                        {afternoon.length > 0 && (
                          <>
                            <p className="text-xs text-gray-500 uppercase mb-1">
                              Afternoon
                            </p>
                            <div className="flex flex-col gap-2 mb-3">
                              {afternoon.map((a, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  {a.time && (
                                    <span className="font-bold text-orange-500 min-w-[50px] text-right">
                                      {a.time}
                                    </span>
                                  )}
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                    {a.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {evening.length > 0 && (
                          <>
                            <p className="text-xs text-gray-500 uppercase mb-1">
                              Evening
                            </p>
                            <div className="flex flex-col gap-2">
                              {evening.map((a, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  {a.time && (
                                    <span className="font-bold text-orange-500 min-w-[50px] text-right">
                                      {a.time}
                                    </span>
                                  )}
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                    {a.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
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
