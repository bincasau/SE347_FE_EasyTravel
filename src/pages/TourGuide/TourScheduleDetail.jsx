import { useState } from "react";
import { useParams } from "react-router-dom";

// Fake data – demo only
const fakeTour = {
  id: 1,
  title: "New Zealand Discovery Tour",
  days: [
    {
      day: 1,
      location: "Auckland",
      steps: [
        { time: "09:00", title: "Meet the group", duration: "1 hour" },
        { time: "11:00", title: "City Walk", duration: "2 hours" },
        { time: "15:00", title: "Sky Tower Visit", duration: "1 hour" },
      ],
    },
    {
      day: 2,
      location: "Christchurch",
      steps: [
        { time: "10:00", title: "Old Town", duration: "1 hour" },
        { time: "11:00", title: "Adventure Park", duration: "1 hour" },
        { time: "12:00", title: "Botanic Gardens", duration: "2 hours" },
        { time: "14:00", title: "Gondola Ride", duration: "30 min" },
      ],
    },
  ],
};

export default function TourScheduleDetail() {
  const { tourId } = useParams();
  const tour = fakeTour;

  const [openDay, setOpenDay] = useState(1);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-400 text-sm"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-orange-500 text-center flex-1">
          {tour.title}
        </h1>

        <div className="w-[80px]" />
      </div>

      {/* DAYS */}
      <div className="space-y-5">
        {tour.days.map((day) => {
          const isOpen = openDay === day.day;

          return (
            <div
              key={day.day}
              className="rounded-xl border bg-white shadow hover:shadow-md transition"
            >
              {/* DAY HEADER */}
              <button
                onClick={() => setOpenDay(isOpen ? null : day.day)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Day {day.day}
                  </h2>
                  <p className="text-sm text-gray-500">{day.location}</p>
                </div>

                <span
                  className={`text-xl font-semibold text-orange-500 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ^
                </span>
              </button>

              {/* CONTENT */}
              {isOpen && (
                <div className="px-5 pb-12 relative">
                  <div className="relative">

                    {/* CENTER TIMELINE */}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] bg-orange-200 h-full rounded" />

                    {/* STEPS */}
                    <div className="space-y-8">
                      {day.steps.map((step, idx) => {
                        const isLeft = idx % 2 === 0;
                        const total = day.steps.length;

                        return (
                          <div
                            key={idx}
                            className={`relative flex w-full ${
                              isLeft
                                ? "justify-start pr-10"
                                : "justify-end pl-10"
                            }`}
                          >
                            {/* TIMELINE ICON */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-2">
                              {idx === 0 ? (
                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                              ) : idx === total - 1 ? (
                                <div className="w-3 h-3 rounded-full border-2 border-orange-400 bg-white" />
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-200" />
                              )}
                            </div>

                            {/* CARD (GẦN TIMELINE HƠN + DÀI HƠN) */}
                            <div
                              className={`w-[50%] ${
                                isLeft ? "text-right pr-2" : "pl-2"
                              }`}
                            >
                              <div className="bg-white border rounded-lg p-4 shadow-sm hover:border-orange-400 hover:shadow transition">
                                <p className="text-xs text-gray-400">
                                  {step.time}
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                  {step.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ⏱ {step.duration}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DECOR */}
                    <img
                      src="/images/decor/palm.png"
                      alt=""
                      className="absolute -bottom-6 left-4 w-16 opacity-80 pointer-events-none"
                    />
                    <img
                      src="/images/decor/whale.png"
                      alt=""
                      className="absolute -bottom-8 right-4 w-20 opacity-80 pointer-events-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
