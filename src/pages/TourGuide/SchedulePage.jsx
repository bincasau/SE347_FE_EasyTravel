import { useEffect, useState } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isAfter,
} from "date-fns";
import Pagination from "@/utils/Pagination";
import MonthHeader from "../../components/pages/TourGuide/schedule/MonthHeader";
import EventList from "../../components/pages/TourGuide/schedule/EventList";

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;
  const today = new Date();

  /* FAKE DATA */
  const exampleSchedule = {
    "2025-12-03": [
      {
        id: 1,
        title: "Lucca Bike Tour",
        img: "/images/tours/tour1.jpg",
        from: "2025-12-03",
        to: "2025-01-05",
        time: "08:00",
        task: "Tour guiding with group A",
      },
    ],
    "2025-12-12": [
      {
        id: 2,
        title: "Florence Cultural Tour",
        img: "/images/tours/tour2.jpg",
        from: "2025-12-12",
        to: "2025-01-14",
        time: "07:00",
        task: "City cultural visit",
      },
      {
        id: 3,
        title: "Wine Tasting Tour",
        img: "/images/tours/tour3.jpg",
        from: "2025-01-12",
        to: "2025-01-12",
        time: "15:00",
        task: "Afternoon tasting session",
      },
    ],
  };

  /* BUILD EVENTS */
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const eventsList = daysInMonth.flatMap((day) => {
    const key = format(day, "yyyy-MM-dd");
    return (exampleSchedule[key] || []).map((ev) => ({
      ...ev,
      dayObj: day,
    }));
  });

  /* PAGINATION */
  const totalPages = Math.ceil(eventsList.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleEvents = eventsList.slice(
    startIndex,
    startIndex + pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [currentMonth]);

  /* MONTH NAV LOGIC */
  const canGoPrev = isAfter(
    startOfMonth(currentMonth),
    startOfMonth(today)
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <MonthHeader
        month={currentMonth}
        onNext={() => setCurrentMonth(addMonths(currentMonth, 1))}
        onPrev={() => setCurrentMonth(subMonths(currentMonth, 1))}
        canGoPrev={canGoPrev}
      />

      <EventList events={visibleEvents} />

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
