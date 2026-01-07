import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RoomCard from "@/components/pages/HotelManager/MyRoom/Card.jsx";

export default function MyRooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("price_asc");
  const [q, setQ] = useState("");

  // ✅ lấy token (tự thử nhiều key phổ biến)
  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  // ✅ fetch auto gửi JWT
  const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();

    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
      mode: "cors",
      credentials: "include",
    });

    // debug khi lỗi
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[FETCH ERROR]", url, res.status, text);
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    return res;
  };

  // ✅ map camelCase API -> snake_case UI
  const normalizeRoom = (r) => ({
    room_id: r.roomId ?? r.room_id,
    room_number: r.roomNumber ?? r.room_number,
    room_type: r.roomType ?? r.room_type,
    number_of_guests: r.numberOfGuest ?? r.number_of_guests,
    price: r.price,
    description: r.desc ?? r.description,
    image_bed: r.imageBed ?? r.image_bed,
    image_wc: r.imageWC ?? r.image_wc,
    created_at: r.createdAt || r.created_at || "",
    status: r.status,
    floor: r.floor,
  });

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      // 1) lấy my hotel -> lấy hotelId
      const myHotelRes = await fetchWithAuth(
        "http://localhost:8080/hotel_manager/my-hotel"
      );
      const hotel = await myHotelRes.json();

      const hotelId = hotel?.hotelId ?? hotel?.hotel_id ?? hotel?.id;
      console.log("[MY HOTEL]", hotel);
      console.log("[HOTEL ID]", hotelId);

      if (!hotelId) throw new Error("Không tìm thấy hotelId từ API my-hotel");

      // 2) lấy rooms theo hotelId (HATEOAS: data._embedded.rooms)
      const roomsRes = await fetchWithAuth(
        `http://localhost:8080/hotels/${hotelId}/rooms`
      );
      const data = await roomsRes.json();

      console.log("[ROOMS RAW]", data);

      const list = data?._embedded?.rooms ?? [];
      console.log("[ROOMS LIST LENGTH]", list.length);

      setRooms(list.map(normalizeRoom));
    } catch (err) {
      console.error("Lỗi load rooms:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []); // fetchWithAuth dùng localStorage nên không cần dep

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadRooms();
    })();
    return () => {
      mounted = false;
    };
  }, [loadRooms]);

  // ✅ Edit route (no id) => pass room via state
  const goEditRoom = (room) => {
    navigate("/hotel-manager/rooms/edit", { state: { room } });
  };

  // ✅ callback: xóa xong update UI ngay (khỏi reload)
  const handleDeleted = (deletedId) => {
    setRooms((prev) =>
      prev.filter((r) => (r.room_id ?? r.roomId) !== deletedId)
    );
  };

  // ✅ Filter by search
  const filteredRooms = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return rooms;

    return rooms.filter((r) => {
      const roomNumber = String(r.room_number ?? "").toLowerCase();
      const roomType = String(r.room_type ?? "").toLowerCase();
      const desc = String(r.description ?? "").toLowerCase();

      return (
        roomNumber.includes(keyword) ||
        roomType.includes(keyword) ||
        desc.includes(keyword)
      );
    });
  }, [rooms, q]);

  // 🔽 Sort logic (sort after filter)
  const sortedRooms = useMemo(() => {
    const data = [...filteredRooms];

    switch (sortBy) {
      case "price_asc":
        return data.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "price_desc":
        return data.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
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
  }, [filteredRooms, sortBy]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 relative">
          {/* ✅ Left: Add Room button */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <button
              onClick={() => navigate("/hotel-manager/hotels/addroom/new")}
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
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
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

            {/* ✅ optional: manual refresh */}
            <button
              onClick={loadRooms}
              className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
              title="Reload"
            >
              ⟳
            </button>
          </div>
        </div>

        {/* ✅ SEARCH BAR */}
        <div className="max-w-6xl mx-auto px-6 pb-5">
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by room number, type, description..."
              className="w-full border rounded-xl px-4 py-2.5 bg-white
                         focus:outline-none focus:ring-2 focus:ring-orange-200"
            />

            {q.trim() && (
              <button
                onClick={() => setQ("")}
                className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Showing <span className="font-semibold">{sortedRooms.length}</span> /{" "}
            <span className="font-semibold">{rooms.length}</span> rooms
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : sortedRooms.length === 0 ? (
          <p className="text-gray-400 text-center">
            No rooms found{q.trim() ? ` for "${q.trim()}"` : ""}.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedRooms.map((room) => (
              <RoomCard
                key={room.room_id ?? room.roomId}
                room={room}
                onEdit={() => goEditRoom(room)}
                onDeleted={handleDeleted}   // ✅ đây là cái thiếu
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
