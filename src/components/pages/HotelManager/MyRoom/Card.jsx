import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

const S3_ROOM_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";

const FALLBACK_IMAGE = `${S3_ROOM_BASE}/standard_bed.jpg`;

export default function RoomCard({ room, onDeleted }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const token =
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const {
    room_id,
    roomId,
    room_number,
    room_type,
    number_of_guests,
    price,
    description,
    image_bed,
    image_wc,
    floor,
    status, // AVAILABLE / BOOKED / MAINTENANCE / INACTIVE
  } = room;

  const id = room_id ?? roomId; // ✅ support both

  const imageUrl = useMemo(() => {
    const bed = Array.isArray(image_bed) ? image_bed[0] : image_bed;
    const wc = Array.isArray(image_wc) ? image_wc[0] : image_wc;

    const toUrl = (v) => {
      if (!v) return "";
      const s = String(v);
      if (s.startsWith("http://") || s.startsWith("https://")) return s;
      return `${S3_ROOM_BASE}/${s}`;
    };

    return toUrl(bed) || toUrl(wc) || FALLBACK_IMAGE;
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

  const goView = () => {
    navigate("/hotel-manager/rooms/view", { state: { room } });
  };

  const goEdit = () => {
    navigate("/hotel-manager/rooms/edit", { state: { room } });
  };

  const doDelete = async () => {
    setDeleteError("");

    if (!id) {
      setDeleteError("Missing room id (room_id/roomId)");
      return;
    }
    if (!token) {
      setDeleteError("NO_TOKEN (Bạn chưa đăng nhập)");
      return;
    }

    const ok = window.confirm(
      `Delete room ${room_number || ""}? This action cannot be undone.`
    );
    if (!ok) return;

    try {
      setDeleting(true);

      const url = `${API_BASE}/hotel_manager/rooms/${id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ct = res.headers.get("content-type") || "";
      const raw = ct.includes("application/json")
        ? await res.json().catch(async () => await res.text())
        : await res.text();

      if (!res.ok) {
        throw new Error(typeof raw === "string" ? raw : JSON.stringify(raw));
      }

      // ✅ notify parent to remove item
      onDeleted?.(id);
    } catch (e) {
      setDeleteError(e?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="flex">
        {/* IMAGE */}
        <div className="w-[220px] bg-gray-100 shrink-0 self-stretch">
          <img
            src={imageUrl}
            alt={room_number || "room"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
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

              <span className="text-orange-600 font-bold text-xl whitespace-nowrap">
                {price !== null && price !== undefined && price !== ""
                  ? `$${price}`
                  : "--"}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <Info label="Guests" value={number_of_guests} />
              <Info label="Floor" value={floor} />
            </div>

            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {description || "--"}
            </p>

            {!!deleteError && (
              <p className="text-xs text-red-600 mt-2 break-words">
                {deleteError}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={goView}
              className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition active:scale-95"
            >
              View
            </button>

            <button
              onClick={goEdit}
              className="px-4 py-1.5 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition hover:-translate-y-[1px] active:scale-95"
            >
              Edit
            </button>

            <button
              onClick={doDelete}
              disabled={deleting}
              className={[
                "px-4 py-1.5 text-sm rounded-lg border transition active:scale-95",
                deleting
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-red-200 text-red-600 hover:bg-red-50",
              ].join(" ")}
              title={!id ? "Missing room id" : "Delete room"}
            >
              {deleting ? "Deleting..." : "Delete"}
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
