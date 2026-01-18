import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <div className="p-5 border rounded-xl shadow hover:shadow-lg transition flex gap-6">
      <img
        src={event.img}
        alt={event.title}
        className="w-40 h-32 rounded-lg object-cover"
      />

      <div className="flex-1">
        <h2 className="text-xl font-semibold">{event.title}</h2>

        <p className="text-gray-600 mt-1">
          <strong>Date:</strong>{" "}
          {format(event.dayObj, "dd MMM yyyy")} (
          {format(event.dayObj, "EEEE")})
        </p>

        <p className="text-gray-600">
          <strong>From – To:</strong>{" "}
          {format(new Date(event.from), "dd MMM yyyy")} →{" "}
          {format(new Date(event.to), "dd MMM yyyy")}
        </p>

        

        <p className="text-gray-700 mt-2">{event.task}</p>

        <Link
          to={`/guide/tour/${event.id}/schedule`}
          className="inline-block mt-3 text-white bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-full"
        >
          View Detail
        </Link>
      </div>
    </div>
  );
}
