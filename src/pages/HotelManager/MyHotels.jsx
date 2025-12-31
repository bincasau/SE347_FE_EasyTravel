import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomCard from "@/components/pages/HotelManager/MyRoom/Card.jsx";

export default function MyRooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("price_asc");

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
        created_at: "2024-09-10",
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

  // ✅ Edit route (no id) => pass room via state
  const goEditRoom = (room) => {
    navigate("/hotel-manager/rooms/edit", { state: { room } });
  };

  // 🔽 Sort logic
  const sortedRooms = useMemo(() => {
    const data = [...rooms];

    switch (sortBy) {
      case "price_asc":
        return data.sort((a, b) => a.price - b.price);
      case "price_desc":
        return data.sort((a, b) => b.price - a.price);
      case "date_desc":
        return data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "date_asc":
        return data.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      default:
        return data;
    }
  }, [rooms, sortBy]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 relative">
          {/* ✅ Left: Add Room button */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <button
              onClick={() => navigate("/hotel-manager/rooms/new")}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold
                         hover:bg-orange-600 transition hover:-translate-y-[1px] active:scale-95"
            >
              + Add Room
            </button>
          </div>

          {/* Center title */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">My Rooms</h1>
            <p className="text-sm text-gray-500 mt-1">Rooms you have added</p>
          </div>

          {/* Sort (right) */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="date_desc">Newest</option>
              <option value="date_asc">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : sortedRooms.length === 0 ? (
          <p className="text-gray-400 text-center">No rooms found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedRooms.map((room) => (
              <RoomCard
                key={room.room_id}
                room={room}
                onEdit={() => goEditRoom(room)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
