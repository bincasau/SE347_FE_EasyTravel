import EventCard from "./EventCard";

export default function EventList({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500 italic text-sm sm:text-base">
          No schedule this month.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {events.map((ev) => (
        <EventCard key={ev.id} event={ev} />
      ))}
    </div>
  );
}
