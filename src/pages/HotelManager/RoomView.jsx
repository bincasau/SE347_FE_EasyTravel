import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RoomView() {
  const navigate = useNavigate();
  const location = useLocation();

  const room = location.state?.room;

  // nếu refresh trang → mất state → quay về danh sách
  useEffect(() => {
    if (!room) {
      navigate("/hotel-manager/hotels", { replace: true });
    }
  }, [room, navigate]);

  if (!room) return null;

  const {
    room_number,
    room_type,
    number_of_guests,
    price,
    description,
    image_bed,
    image_wc,
    status,
    floor,
  } = room;

  const images = useMemo(() => {
    const bed = Array.isArray(image_bed) ? image_bed : image_bed ? [image_bed] : [];
    const wc = Array.isArray(image_wc) ? image_wc : image_wc ? [image_wc] : [];
    const all = [...bed, ...wc];
    return all.length ? all : ["/images/placeholder-room.jpg"];
  }, [image_bed, image_wc]);

  const statusColor = {
    AVAILABLE: "bg-green-100 text-green-700",
    BOOKED: "bg-red-100 text-red-700",
    OCCUPIED: "bg-red-100 text-red-700",
    MAINTENANCE: "bg-yellow-100 text-yellow-700",
    INACTIVE: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== TOP BAR ===== */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
          >
            ← Back
          </button>

          <h1 className="flex-1 text-center text-xl font-semibold">
            Room Detail
          </h1>

          <div className="w-[90px]" />
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* IMAGE */}
        <div className="rounded-2xl overflow-hidden border bg-gray-100">
          <img
            src={images[0]}
            alt="Room"
            className="w-full h-[320px] object-cover"
          />
        </div>

        {/* BASIC INFO */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          {/* TITLE */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-bold">
              Room <span className="text-orange-600">{room_number}</span>
            </h2>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                statusColor[status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {status || "UNKNOWN"}
            </span>
          </div>

          {/* GRID INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info label="Room Type" value={room_type} />
            <Info label="Guests" value={number_of_guests} />
            <Info label="Floor" value={floor} />
            <Info
              label="Price"
              value={price ? `$${price}` : "--"}
              highlight
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {description || "--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`text-lg font-semibold ${
          highlight ? "text-orange-600" : "text-gray-900"
        }`}
      >
        {value ?? "--"}
      </div>
    </div>
  );
}
