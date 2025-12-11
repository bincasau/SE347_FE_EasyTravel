import {
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  TagIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export default function AdminTourCard({ tour, onEdit, onRemove }) {
  const {
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
    : `/images/tour/${mainImage}`;

  return (
    <div className="flex items-center gap-6 py-6 border-b border-gray-200">
      {/* IMAGE */}
      <div className="w-[260px] h-[180px]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-3">{title}</h2>

        <div className="flex gap-12">
          {/* LEFT COLUMN */}
          <div className="space-y-3 text-[15px]">
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
          <div className="space-y-3 text-[15px]">
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
                <span className="font-semibold">Price Adult:</span>{" "}
                {priceAdult.toLocaleString()} đ
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <p>
                <span className="font-semibold">Price Child:</span>{" "}
                {priceChild?.toLocaleString()} đ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS + FINAL PRICE (ADULT) */}
      <div className="flex flex-col items-end gap-3 min-w-[150px]">
        <div className="text-[15px]">
          from{" "}
          <span className="text-xl font-bold">
            {finalPriceAdult.toLocaleString()} đ
          </span>
        </div>

        <button
          onClick={onEdit}
          className="px-6 py-1.5 border border-orange-400 text-orange-500 rounded-full hover:bg-orange-50 transition"
        >
          Edit
        </button>

        <button
          onClick={onRemove}
          className="px-6 py-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
