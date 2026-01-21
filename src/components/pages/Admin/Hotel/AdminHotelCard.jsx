import {
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const S3_HOTEL_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

export default function AdminHotelCard({ hotel, onEdit, onRemove }) {
  const navigate = useNavigate();

  const imageUrl = hotel?.mainImage?.startsWith("http")
    ? hotel.mainImage
    : hotel?.mainImage
      ? `${S3_HOTEL_BASE}/${hotel.mainImage}`
      : "";

  // trang edit chỉ cần id (không truyền state)
  const handleEdit = () => {
    const hid = hotel?.hotelId ?? hotel?.id;
    if (!hid) return;
    navigate(`/admin/hotels/update/${hid}`);
    if (typeof onEdit === "function") onEdit(hotel);
  };

  // ✅ Card chỉ “phát sự kiện” remove, KHÔNG gọi API, KHÔNG confirm ở đây
  // (confirm + delete + reload sẽ do HotelManagement xử lý)
  const handleRemove = () => {
    const hid = hotel?.hotelId ?? hotel?.id;
    if (!hid) return;
    if (typeof onRemove === "function") onRemove(hid);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString("vi-VN");
  };

  const managerId = hotel?.managerId ?? hotel?.manager_id ?? "—";
  const minPrice = hotel?.minPrice ?? hotel?.min_price ?? null;

  return (
    <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 sm:gap-6 p-4 sm:p-6">
        {/* IMAGE */}
        <div className="w-full sm:w-60 shrink-0">
          <img
            src={imageUrl}
            alt={hotel?.name || "Khách sạn"}
            className="w-full h-48 sm:h-36 rounded-xl object-cover bg-gray-100"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-2xl font-semibold mb-3 line-clamp-2 break-words">
            {hotel?.name || "—"}
          </h2>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 text-sm text-gray-700">
            <InfoRow
              icon={<BuildingOffice2Icon className="w-5 h-5 text-orange-400" />}
              label="Mã khách sạn"
              value={hotel?.hotelId ?? hotel?.id ?? "—"}
            />

            <InfoRow
              icon={<UserIcon className="w-5 h-5 text-orange-400" />}
              label="Mã quản lý"
              value={managerId}
            />

            <InfoRow
              icon={<MapPinIcon className="w-5 h-5 text-orange-400" />}
              label="Địa chỉ"
              value={hotel?.address || "—"}
              breakWords
            />

            <InfoRow
              icon={<CurrencyDollarIcon className="w-5 h-5 text-orange-400" />}
              label="Giá thấp nhất"
              value={
                minPrice === null || minPrice === undefined
                  ? "—"
                  : `${Number(minPrice).toLocaleString("vi-VN")} đ`
              }
            />

            <InfoRow
              icon={<EnvelopeIcon className="w-5 h-5 text-orange-400" />}
              label="Email"
              value={hotel?.email || "—"}
              breakWords
            />

            <InfoRow
              icon={<CalendarDaysIcon className="w-5 h-5 text-orange-400" />}
              label="Ngày thêm"
              value={formatDate(hotel?.createdAt || hotel?.created_at)}
            />

            <InfoRow
              icon={<PhoneIcon className="w-5 h-5 text-orange-400" />}
              label="Hotline"
              value={hotel?.phoneNumber || hotel?.phone_number || "—"}
            />

            <InfoRow
              icon={<ClockIcon className="w-5 h-5 text-orange-400" />}
              label="Cập nhật"
              value={formatDate(hotel?.updatedAt || hotel?.updated_at)}
            />
          </div>

          {/* ACTIONS (mobile) */}
          <div className="mt-4 flex flex-col gap-2 sm:hidden">
            <button
              onClick={handleEdit}
              className="w-full border border-orange-500 text-orange-500 px-6 py-2 rounded-full hover:bg-orange-50 transition font-medium"
            >
              Sửa
            </button>

            <button
              onClick={handleRemove}
              className="w-full bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition font-medium"
            >
              Xóa
            </button>
          </div>
        </div>

        {/* ACTIONS (desktop) */}
        <div className="hidden sm:flex flex-col items-end gap-3 ml-2">
          <button
            onClick={handleEdit}
            className="border border-orange-500 text-orange-500 px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium whitespace-nowrap"
          >
            Sửa
          </button>

          <button
            onClick={handleRemove}
            className="bg-orange-500 text-white px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium whitespace-nowrap"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, breakWords = false }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className={["min-w-0", breakWords ? "break-words" : ""].join(" ")}>
        <span className="font-semibold">{label}:</span>{" "}
        <span className="text-gray-800">{value}</span>
      </p>
    </div>
  );
}
