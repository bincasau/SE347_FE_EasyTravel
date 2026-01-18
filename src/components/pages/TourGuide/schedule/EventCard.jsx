import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <div className="p-4 sm:p-5 border rounded-2xl shadow-sm hover:shadow-lg transition bg-white">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <img
          src={event.img}
          alt={event.title}
          className="w-full sm:w-40 h-44 sm:h-32 rounded-xl object-cover"
          loading="lazy"
        />

        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
            {event.title}
          </h2>

          <div className="mt-2 space-y-1 text-sm sm:text-base text-gray-600">
            <p className="break-words">
              <span className="font-semibold text-gray-700">Date:</span>{" "}
              {format(event.dayObj, "dd MMM yyyy")} (
              {format(event.dayObj, "EEEE")})
            </p>

            <p className="break-words">
              <span className="font-semibold text-gray-700">From – To:</span>{" "}
              {format(new Date(event.from), "dd MMM yyyy")} →{" "}
              {format(new Date(event.to), "dd MMM yyyy")}
            </p>
          </div>

          {event.task ? (
            <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed break-words">
              {event.task}
            </p>
          ) : null}

          <div className="mt-4">
            <Link
              to={`/guide/tour/${event.id}/schedule`}
              className="inline-flex items-center justify-center w-full sm:w-auto
                         text-white bg-orange-500 hover:bg-orange-400
                         px-4 py-2 rounded-full text-sm sm:text-base"
            >
              View Detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
