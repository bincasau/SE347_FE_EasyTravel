// src/components/admin/AdminTourCard.jsx (hoặc đúng path bạn đang dùng)
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

export default function AdminTourCard({ tour, onEdit, onRemove }) {
  const navigate = useNavigate();

  const {
    tourId,
    title,
    mainImage,
    startDate,
    endDate,
    durationDays,
    priceAdult,
    priceChild,
    percentDiscount,
    availableSeats,
    limitSeats,
    departureLocation,
    destination,
  } = tour;

  const finalPriceAdult = priceAdult - (priceAdult * percentDiscount) / 100;

  const imageUrl = mainImage?.startsWith("http")
    ? mainImage
    : `${S3_TOUR_BASE}/${mainImage}`;


  const handleEdit = () => {
    navigate(`/admin/tours/edit/${tourId}`);
    if (typeof onEdit === "function") onEdit(tour);
  };

  // remove dùng API deleteTour + confirm
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
    <div className="flex items-center gap-8 bg-white p-6 rounded-2xl shadow-md w-full">
      {/* IMAGE */}
      <img
        src={imageUrl}
        alt={title}
        className="w-60 h-36 rounded-xl object-cover flex-shrink-0 bg-gray-100"
      />

      {/* MAIN CONTENT */}
      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-3 line-clamp-2">{title}</h2>

        <div className="flex gap-12 text-sm text-gray-700">
          {/* LEFT COLUMN */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Date:</span> {startDate} →{" "}
                {endDate}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <UsersIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Seats:</span> {availableSeats}/
                {limitSeats}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <MapPinIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Departure:</span>{" "}
                {departureLocation}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <MapPinIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Destination:</span>{" "}
                {destination}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <ClockIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Duration:</span> {durationDays}{" "}
                days
              </p>
            </div>

            <div className="flex items-start gap-2">
              <TagIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Discount:</span>{" "}
                {percentDiscount}%
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Adult:</span>{" "}
                {Number(priceAdult || 0).toLocaleString()} đ
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Child:</span>{" "}
                {Number(priceChild || 0).toLocaleString()} đ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col items-end gap-4 ml-4">
        <div className="text-sm text-gray-700">
          from{" "}
          <span className="text-xl font-bold text-gray-900">
            {Number(finalPriceAdult || 0).toLocaleString()} đ
          </span>
        </div>

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
