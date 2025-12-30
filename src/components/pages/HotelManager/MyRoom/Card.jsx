import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function RoomCard({ room }) {
  const navigate = useNavigate();

  const {
    room_id, // keep for navigation only (not displayed)
    hotel_id, // keep for navigation only (not displayed)
    room_number,
    room_type,
    number_of_guests,
    price,
    description,
    image_bed,
    image_wc,

    // ✅ NEW fields
    floor,
    status, // e.g. AVAILABLE / BOOKED / MAINTENANCE / INACTIVE
  } = room;

  const imageUrl = useMemo(() => {
    const bed = Array.isArray(image_bed) ? image_bed[0] : image_bed;
    const wc = Array.isArray(image_wc) ? image_wc[0] : image_wc;
    return bed || wc || "/images/placeholder-room.jpg";
  }, [image_bed, image_wc]);

  const statusMeta = useMemo(() => {
    const s = String(status || "").toUpperCase();

    if (s === "AVAILABLE")
      return {
        text: "Available",
        cls: "bg-green-50 text-green-700 border-green-200",
      };
    if (s === "BOOKED" || s === "OCCUPIED")
      return {
        text: "Booked",
        cls: "bg-red-50 text-red-700 border-red-200",
      };
    if (s === "MAINTENANCE")
      return {
        text: "Maintenance",
        cls: "bg-yellow-50 text-yellow-800 border-yellow-200",
      };
    if (s === "INACTIVE" || s === "DISABLED")
      return {
        text: "Inactive",
        cls: "bg-gray-50 text-gray-700 border-gray-200",
      };

    return {
      text: status ? String(status) : "Unknown",
      cls: "bg-gray-50 text-gray-700 border-gray-200",
    };
  }, [status]);

  return (
    <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="flex">
        {/* IMAGE */}
        <div className="w-[220px] bg-gray-100 shrink-0 self-stretch">
          <img
            src={imageUrl}
            alt={room_number || "room"}
            className="w-full h-full object-cover"
          />
        </div>

        {/* INFO */}
        <div className="flex-1 px-4 py-3 flex flex-col justify-between">
          {/* TOP */}
          <div>
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                    Room{" "}
                    <span className="text-orange-600 font-semibold">
                      {room_number || "--"}
                    </span>
                  </h3>

                  {/* ✅ Status badge */}
                  <span
                    className={[
                      "text-xs px-2 py-1 rounded-full border font-semibold",
                      statusMeta.cls,
                    ].join(" ")}
                  >
                    {statusMeta.text}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mt-0.5">
                  Type:{" "}
                  <span className="text-orange-600 font-medium">
                    {room_type || "--"}
                  </span>
                </div>
              </div>

              {/* ✅ bigger price */}
              <span className="text-orange-600 font-bold text-xl whitespace-nowrap">
                {price !== null && price !== undefined && price !== ""
                  ? `$${price}`
                  : "--"}
              </span>
            </div>

            {/* Grid info */}
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <Info label="Guests" value={number_of_guests} />
              <Info label="Floor" value={floor} />
            </div>

            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {description || "--"}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() =>
                navigate(`/hotel-manager/hotels/${hotel_id}/rooms/${room_id}`)
              }
              className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              View
            </button>

            <button
              onClick={() =>
                navigate(
                  `/hotel-manager/hotels/${hotel_id}/rooms/${room_id}/edit`
                )
              }
              className="px-4 py-1.5 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <span className="text-xs text-gray-500">{label}: </span>
      <span className="text-gray-800">
        {value === null || value === undefined || value === "" ? "--" : value}
      </span>
    </div>
  );
}
