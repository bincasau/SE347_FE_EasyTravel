import { useEffect, useState } from "react";
import RoomCard from "@/components/pages/HotelManager/MyRoom/Card.jsx";

export default function MyRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mock = [
      {
        room_id: 1,
        hotel_id: 2,
        room_number: "A101",
        room_type: "Deluxe",
        number_of_guests: 2,
        price: 59,
        description: "Nice room with balcony.",
        image_bed:
          "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80&auto=format&fit=crop",
        image_wc:
          "https://images.unsplash.com/photo-1600566753051-f0fbc6c0c0c5?w=1200&q=80&auto=format&fit=crop",
      },
    ];

    setTimeout(() => {
      setRooms(mock);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">My Rooms</h1>
          <p className="text-sm text-gray-500 mt-1">Rooms you have added</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : rooms.length === 0 ? (
          <p className="text-gray-400 text-center">No rooms found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {rooms.map((r) => (
              <RoomCard key={r.room_id} room={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
