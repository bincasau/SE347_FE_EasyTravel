import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "@/utils/auth";
import { popup } from "@/utils/popup";

const API_BASE = "http://localhost:8080";

const S3_ROOM_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";

const FALLBACK_IMAGE = `${S3_ROOM_BASE}/standard_bed.jpg`;

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

  const goView = () =>
    navigate("/hotel-manager/rooms/view", { state: { room, id } });
  const goEdit = () =>
    navigate("/hotel-manager/rooms/edit", { state: { room, id } });

  const doDelete = async () => {
    setDeleteError("");

    if (!id) {
      const msg = "Thiếu room id (room_id/roomId)";
      setDeleteError(msg);
      popup.error(msg);
      return;
    }

    const ok = await popup.confirmDanger(
      "Bạn chắc chắn muốn xoá phòng này?",
      "Xoá phòng"
    );
    if (!ok) return;

    const token = getToken();
    const closeLoading = popup.loading("Đang xoá phòng...");

    try {
      setDeleting(true);

      const url = `${API_BASE}/hotel_manager/rooms/${id}`;
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const raw = await readResponseSmart(res);

      console.log("[RoomCard] DELETE", {
        url,
        status: res.status,
        ok: res.ok,
        raw,
      });

      if (!res.ok) {
        throw new Error(typeof raw === "string" ? raw : JSON.stringify(raw));
      }

      popup.success("Đã xoá phòng!");
      onDeleted?.(id);
    } catch (e) {
      const msg = e?.message || "Xoá phòng thất bại";
      setDeleteError(msg);
      popup.error(msg);
    } finally {
      closeLoading();
      setDeleting(false);
    }
  };

  return (
    <div
      className="
        bg-white border rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden
        h-[280px] sm:h-[200px]
      "
    >
      {/* ✅ h-full để nội dung không bị tràn */}
      <div className="flex flex-col sm:flex-row h-full">
        {/* ✅ FIX: vùng ảnh có height rõ ràng, img h-full */}
        <div className="w-full sm:w-[220px] h-[160px] sm:h-full bg-gray-100 shrink-0">
          <img
            src={imageUrl}
            alt={showRoomNumber || "room"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        {/* ✅ FIX: content h-full + justify-between để nút luôn nằm dưới */}
        <div className="flex-1 px-4 sm:px-5 py-3 sm:py-4 flex flex-col justify-between min-w-0 h-full">
          <div className="min-w-0">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                  Phòng{" "}
                  <span className="text-orange-600 font-semibold">
                    {showRoomNumber || "--"}
                  </span>
                </h3>

                <div className="text-sm text-gray-600 mt-1 break-words">
                  Loại:{" "}
                  <span className="text-orange-600 font-medium line-clamp-1">
                    {showRoomType || "--"}
                  </span>
                </div>
              </div>

              <span className="text-orange-600 font-bold text-lg sm:text-xl whitespace-nowrap">
                {price !== null && price !== undefined && price !== ""
                  ? formatVND(safeNumber(price, NaN))
                  : "--"}
              </span>
            </div>

            <div className="mt-2 text-sm">
              <Info label="Số khách" value={showGuests} />
            </div>

            {/* ✅ giữ 2 dòng để không đội chiều cao */}
            <p className="text-sm text-gray-600 mt-2 line-clamp-2 break-words">
              {showDesc || "--"}
            </p>

            {!!deleteError && (
              <p className="text-xs text-red-600 mt-2 break-words">
                {deleteError}
              </p>
            )}
          </div>

          {/* ✅ nút luôn ở đáy */}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button
              onClick={goView}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
            >
              Xem
            </button>

            <button
              onClick={goEdit}
              className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              Sửa
            </button>

            <button
              onClick={doDelete}
              disabled={deleting}
              className={[
                "px-4 py-2 text-sm rounded-lg border",
                deleting
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-red-200 text-red-600 hover:bg-red-50",
              ].join(" ")}
            >
              {deleting ? "Đang xoá..." : "Xoá"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}: </span>
      <span className="text-gray-800">
        {value === null || value === undefined || value === "" ? "--" : value}
      </span>
    </div>
  );
}
