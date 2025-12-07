import { useState } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from "date-fns";
import { Link } from "react-router-dom";

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAll, setShowAll] = useState(false);

  // Fake schedule – replace with API later
  const exampleSchedule = {
    "2025-12-03": [
      {
        id: 1,
        title: "Lucca Bike Tour",
        img: "/images/tours/tour1.jpg",
        from: "2025-12-03",
        to: "2025-01-05",
        time: "08:00",
        task: "Tour guiding with group A"
      }
    ],
    "2025-12-12": [
      {
        id: 2,
        title: "Florence Cultural Tour",
        img: "/images/tours/tour2.jpg",
        from: "2025-12-12",
        to: "2025-01-14",
        time: "07:00",
        task: "City cultural visit"
      },
      {
        id: 3,
        title: "Wine Tasting Tour",
        img: "/images/tours/tour3.jpg",
        from: "2025-01-12",
        to: "2025-01-12",
        time: "15:00",
        task: "Afternoon tasting session"
      }
    ],
    "2025-12-21": [
      {
        id: 4,
        title: "Tuscan Sunset Tour",
        img: "/images/tours/tour4.jpg",
        from: "2025-01-21",
        to: "2025-01-21",
        time: "16:00",
        task: "Evening photoshoot"
      }
    ]
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const eventsList = daysInMonth.flatMap((day) => {
    const key = format(day, "yyyy-MM-dd");
    return (exampleSchedule[key] || []).map((ev) => ({
      ...ev,
      date: key,
      dayObj: day
    }));
  });

  const visibleEvents = showAll ? eventsList : eventsList.slice(0, 5);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* MONTH SELECTOR */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={prevMonth}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          ← Previous
        </button>

        <h1 className="text-3xl font-bold text-orange-500">
          {format(currentMonth, "MMMM yyyy")}
        </h1>

        <button
          onClick={nextMonth}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Next →
        </button>
      </div>

      {/* EVENTS LIST */}
      <div className="space-y-6">
        {visibleEvents.length === 0 && (
          <p className="text-gray-500 italic">No schedule this month.</p>
        )}

        {visibleEvents.map((ev) => (
          <div
            key={ev.id}
            className="p-5 border rounded-xl shadow hover:shadow-lg transition flex gap-6"
          >
            {/* IMAGE */}
            <img
              src={ev.img}
              alt={ev.title}
              className="w-40 h-32 rounded-lg object-cover"
            />

            {/* DETAILS */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {ev.title}
              </h2>

              <p className="text-gray-600 mt-1">
                <strong>Date:</strong> {format(ev.dayObj, "dd MMM yyyy")}{" "}
                ({format(ev.dayObj, "EEEE")})
              </p>

              <p className="text-gray-600">
                <strong>From – To:</strong>{" "}
                {format(new Date(ev.from), "dd MMM yyyy")} →{" "}
                {format(new Date(ev.to), "dd MMM yyyy")}
              </p>

              <p className="text-gray-600">
                <strong>Time:</strong> {ev.time}
              </p>

              <p className="text-gray-700 mt-2">{ev.task}</p>

              {/* VIEW DETAIL */}
              <Link
                 to={`/guide/tour/${ev.id}/schedule`}
                className="inline-block mt-3 text-white bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-full"
              >
                View Detail
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MORE */}
      {eventsList.length > 5 && !showAll && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-400"
          >
            View More
          </button>
        </div>
      )}
    </div>
  );
}
