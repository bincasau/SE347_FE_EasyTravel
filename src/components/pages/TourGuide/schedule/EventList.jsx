import EventCard from "./EventCard";

export default function EventList({ events }) {
  if (events.length === 0) {
    return <p className="text-gray-500 italic">No schedule this month.</p>;
  }

  return (
    <div className="space-y-6">
      {events.map((ev) => (
        <EventCard key={ev.id} event={ev} />
      ))}
    </div>
  );
}
