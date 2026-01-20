// src/components/admin/AdminTourCard.jsx
import { useNavigate } from "react-router-dom";
import {
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  TagIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { deleteTour } from "@/apis/Tour";

const S3_TOUR_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/tour";

const FALLBACK_IMG = `${S3_TOUR_BASE}/tour_default.jpg`; // nếu bạn có file này; không có thì đổi sang ảnh khác

function money(v) {
  return Number(v || 0).toLocaleString();
}

export default function AdminTourCard({ tour, onEdit, onRemove }) {
  const navigate = useNavigate();

  const tourId = tour?.tourId ?? tour?.id;
  const title = tour?.title ?? "Untitled tour";
  const mainImage = tour?.mainImage ?? "";
  const startDate = tour?.startDate ?? "-";
  const endDate = tour?.endDate ?? "-";
  const durationDays = tour?.durationDays ?? "-";
  const priceAdult = Number(tour?.priceAdult ?? 0);
  const priceChild = Number(tour?.priceChild ?? 0);
  const percentDiscount = Number(tour?.percentDiscount ?? 0);
  const availableSeats = tour?.availableSeats ?? "-";
  const limitSeats = tour?.limitSeats ?? "-";
  const departureLocation = tour?.departureLocation ?? "-";
  const destination = tour?.destination ?? "-";

  const finalPriceAdult = Math.max(
    0,
    priceAdult - (priceAdult * percentDiscount) / 100,
  );

  const imageUrl = mainImage
    ? mainImage.startsWith("http")
      ? mainImage
      : `${S3_TOUR_BASE}/${mainImage}`
    : FALLBACK_IMG;

  const handleEdit = () => {
    if (tourId) navigate(`/admin/tours/edit/${tourId}`);
    if (typeof onEdit === "function") onEdit(tour);
  };

  const handleRemove = async () => {
    const ok = window.confirm("Bạn có chắc chắn muốn xóa tour này không?");
    if (!ok) return;

    try {
      await deleteTour(Number(tourId));
      if (typeof onRemove === "function") onRemove(tour);
    } catch (e) {
      alert(e?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
        {/* IMAGE */}
        <div className="w-full lg:w-[260px] flex-shrink-0">
          <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-semibold mb-3 line-clamp-2">
            {title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm text-gray-700">
            {/* LEFT */}
            <div className="space-y-2 min-w-0">
              <Info
                icon={<CalendarDaysIcon className="w-5 h-5 text-orange-400" />}
                label="Date"
                value={`${startDate} → ${endDate}`}
              />
              <Info
                icon={<UsersIcon className="w-5 h-5 text-orange-400" />}
                label="Seats"
                value={`${availableSeats}`}
              />
              <Info
                icon={<MapPinIcon className="w-5 h-5 text-orange-400" />}
                label="Departure"
                value={departureLocation}
              />
              <Info
                icon={<MapPinIcon className="w-5 h-5 text-orange-400" />}
                label="Destination"
                value={destination}
              />
            </div>

            {/* RIGHT */}
            <div className="space-y-2 min-w-0">
              <Info
                icon={<ClockIcon className="w-5 h-5 text-orange-400" />}
                label="Duration"
                value={`${durationDays} days`}
              />
              <Info
                icon={<TagIcon className="w-5 h-5 text-orange-400" />}
                label="Discount"
                value={`${percentDiscount}%`}
              />
              <Info
                icon={
                  <CurrencyDollarIcon className="w-5 h-5 text-orange-400" />
                }
                label="Adult"
                value={`${money(priceAdult)} đ`}
              />
              <Info
                icon={
                  <CurrencyDollarIcon className="w-5 h-5 text-orange-400" />
                }
                label="Child"
                value={`${money(priceChild)} đ`}
              />
            </div>
          </div>
        </div>

        {/* ACTIONS (responsive) */}
        <div className="w-full lg:w-auto flex flex-col gap-3 lg:items-end">
          <div className="text-sm text-gray-700">
            from{" "}
            <span className="text-xl font-bold text-gray-900">
              {money(finalPriceAdult)} đ
            </span>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
            <button
              onClick={handleEdit}
              className="w-full sm:w-auto border border-orange-500 text-orange-500 px-6 sm:px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium"
            >
              Edit
            </button>

            <button
              onClick={handleRemove}
              className="w-full sm:w-auto bg-orange-500 text-white px-6 sm:px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <p className="min-w-0">
        <span className="font-semibold">{label}:</span>{" "}
        <span className="break-words">{value ?? "—"}</span>
      </p>
    </div>
  );
}
