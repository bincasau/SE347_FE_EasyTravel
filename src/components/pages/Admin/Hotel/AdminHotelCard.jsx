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
import { deleteHotel } from "@/apis/Hotel";

const S3_HOTEL_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

export default function AdminHotelCard({ hotel, onEdit, onRemove }) {
  const navigate = useNavigate();

  const imageUrl = hotel?.mainImage?.startsWith("http")
    ? hotel.mainImage
    : `${S3_HOTEL_BASE}/${hotel?.mainImage || ""}`;

  // 1) trang edit chỉ cần id (không truyền state)
  const handleEdit = () => {
    navigate(`/admin/hotels/update/${hotel.hotelId}`);
    if (typeof onEdit === "function") onEdit(hotel);
  };

  const handleRemove = async () => {
    const ok = window.confirm("Bạn có chắc chắn muốn xóa khách sạn này không?");
    if (!ok) return;

    try {
      await deleteHotel(hotel.hotelId);
      if (typeof onRemove === "function") onRemove(hotel.hotelId);
    } catch (e) {
      alert(e?.message || "Xóa thất bại");
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString("en-GB");
  };

  const managerId = hotel?.managerId ?? hotel?.manager_id ?? "—";
  const minPrice = hotel?.minPrice ?? hotel?.min_price ?? null;

  return (
    <div className="flex items-center gap-8 bg-white p-6 rounded-2xl shadow-md w-full">
      {/* IMAGE */}
      <img
        src={imageUrl}
        alt={hotel?.name}
        className="w-60 h-36 rounded-xl object-cover flex-shrink-0 bg-gray-100"
      />

      {/* MAIN CONTENT */}
      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-3 line-clamp-2">
          {hotel?.name}
        </h2>

        <div className="flex gap-12 text-sm text-gray-700">
          {/* LEFT COLUMN */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <BuildingOffice2Icon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Hotel ID:</span>{" "}
                {hotel?.hotelId}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <MapPinIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="break-words">
                <span className="font-semibold">Address:</span>{" "}
                {hotel?.address || "—"}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <EnvelopeIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="break-words">
                <span className="font-semibold">Email:</span>{" "}
                {hotel?.email || "—"}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <PhoneIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Hotline:</span>{" "}
                {hotel?.phoneNumber || hotel?.phone_number || "—"}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-2">
            {/* 2) xóa rate ảo -> thay bằng managerId + minPrice */}
            <div className="flex items-start gap-2">
              <UserIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Manager ID:</span> {managerId}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Min price:</span>{" "}
                {minPrice === null || minPrice === undefined
                  ? "—"
                  : Number(minPrice).toLocaleString()}{" "}
                đ
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Added on:</span>{" "}
                {formatDate(hotel?.createdAt || hotel?.created_at)}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <ClockIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Update:</span>{" "}
                {formatDate(hotel?.updatedAt || hotel?.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col items-end gap-4 ml-4">
        <button
          onClick={handleEdit}
          className="border border-orange-500 text-orange-500 px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium"
        >
          Edit
        </button>

        <button
          onClick={handleRemove}
          className="bg-orange-500 text-white px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
