import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

const S3_ROOM_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";

const FALLBACK_IMAGE = `${S3_ROOM_BASE}/standard_bed.jpg`;

/** -------- helpers -------- */
function getToken() {
  return (
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

async function readResponseSmart(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json().catch(() => res.text());
  }
  return res.text();
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatVND(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  return `${n.toLocaleString("vi-VN")}₫`;
}

export default function RoomCard({ room, onDeleted }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ✅ support both snake_case & camelCase
  const {
    room_id,
    roomId,
    room_number,
    roomNumber,
    room_type,
    roomType,
    number_of_guests,
    numberOfGuest,
    price,
    description,
    desc,
    image_bed,
    imageBed,
    image_wc,
    imageWC,
    floor,
    status,
  } = room || {};

  const id = room_id ?? roomId;
  const showRoomNumber = room_number ?? roomNumber;
  const showRoomType = room_type ?? roomType;
  const showGuests = number_of_guests ?? numberOfGuest;
  const showDesc = description ?? desc;

  const imageUrl = useMemo(() => {
    const bed = Array.isArray(image_bed ?? imageBed)
      ? (image_bed ?? imageBed)[0]
      : image_bed ?? imageBed;

    const wc = Array.isArray(image_wc ?? imageWC)
      ? (image_wc ?? imageWC)[0]
      : image_wc ?? imageWC;

    const toUrl = (v) => {
      if (!v) return "";
      const s = String(v);
      if (s.startsWith("http://") || s.startsWith("https://")) return s;
      return `${S3_ROOM_BASE}/${s}`;
    };

    return toUrl(bed) || toUrl(wc) || FALLBACK_IMAGE;
  }, [image_bed, imageBed, image_wc, imageWC]);

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

  const goView = () => navigate("/hotel-manager/rooms/view", { state: { room } });
  const goEdit = () => navigate("/hotel-manager/rooms/edit", { state: { room } });

  const doDelete = async () => {
    setDeleteError("");

    if (!id) {
      setDeleteError("Missing room id (room_id/roomId)");
      return;
    }

    const token = getToken();
    if (!token) {
      setDeleteError("NO_TOKEN (Bạn chưa đăng nhập)");
      return;
    }

    const ok = window.confirm(
      `Delete room ${showRoomNumber || id}? This action cannot be undone.`
    );
    if (!ok) return;

    try {
      setDeleting(true);

      const url = `${API_BASE}/hotel_manager/rooms/${id}`;

      const res = await fetch(url, {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const raw = await readResponseSmart(res);

      console.log("[RoomCard] DELETE", { url, status: res.status, ok: res.ok, raw });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            "403 Forbidden. JWT/role HOTEL_MANAGER chưa được BE accept, hoặc OPTIONS(/error) bị chặn."
          );
        }
        throw new Error(typeof raw === "string" ? raw : JSON.stringify(raw));
      }

      onDeleted?.(id);
    } catch (e) {
      setDeleteError(e?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
      {/* ✅ mobile: column | sm+: row */}
      <div className="flex flex-col sm:flex-row">
        {/* IMAGE */}
        <div className="w-full sm:w-[220px] bg-gray-100 shrink-0">
          <img
            src={imageUrl}
            alt={showRoomNumber || "room"}
            className="w-full h-52 sm:h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        {/* INFO */}
        <div className="flex-1 px-4 sm:px-5 py-4 flex flex-col justify-between min-w-0">
          {/* TOP */}
          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight break-words">
                    Room{" "}
                    <span className="text-orange-600 font-semibold">
                      {showRoomNumber || "--"}
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

                <div className="text-sm text-gray-600 mt-1 break-words">
                  Type:{" "}
                  <span className="text-orange-600 font-medium">
                    {showRoomType || "--"}
                  </span>
                </div>
              </div>

              {/* ✅ Price: không tràn, canh phải trên desktop */}
              <span className="text-orange-600 font-bold text-lg sm:text-xl whitespace-nowrap sm:text-right">
                {price !== null && price !== undefined && price !== ""
                  ? formatVND(safeNumber(price, NaN))
                  : "--"}
              </span>
            </div>

            {/* ✅ Info grid: mobile 2 cột vẫn ok, nhưng tự xuống 1 cột nếu quá hẹp */}
            <div className="mt-3 grid grid-cols-2 xs:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Info label="Guests" value={showGuests} />
              <Info label="Floor" value={floor} />
            </div>

            <p className="text-sm text-gray-600 mt-3 line-clamp-2 break-words">
              {showDesc || "--"}
            </p>

            {!!deleteError && (
              <p className="text-xs text-red-600 mt-2 break-words">
                {deleteError}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="mt-4 flex flex-wrap sm:flex-nowrap justify-end gap-2">
            <button
              onClick={goView}
              className="px-4 py-2 sm:py-1.5 text-sm rounded-full sm:rounded-lg border border-gray-300 hover:bg-gray-50 transition active:scale-95 w-full sm:w-auto"
            >
              View
            </button>

            <button
              onClick={goEdit}
              className="px-4 py-2 sm:py-1.5 text-sm rounded-full sm:rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition hover:-translate-y-[1px] active:scale-95 w-full sm:w-auto"
            >
              Edit
            </button>

            <button
              onClick={doDelete}
              disabled={deleting}
              className={[
                "px-4 py-2 sm:py-1.5 text-sm rounded-full sm:rounded-lg border transition active:scale-95 w-full sm:w-auto",
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
      <span className="text-gray-800 break-words">
        {value === null || value === undefined || value === "" ? "--" : value}
      </span>
    </div>
  );
}
