import React from "react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaChild,
  FaTags,
  FaCheckCircle,
  FaPlaneDeparture,
} from "react-icons/fa";

export default function Detail({ tour }) {
  if (!tour) return null;

  const {
    priceAdult,
    priceChild,
    percentDiscount,
    durationDays,
    startDate,
    endDate,
    departureLocation,
    destination,
    availableSeats,
    limitSeats,
    status,
    createdAt,
  } = tour;

  const formatCurrency = (val) =>
    Number(val ?? 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      {/* 🧭 Tiêu đề */}
      <h2 className="text-4xl font-podcast text-gray-800 mb-10">Overview</h2>

      {/* Grid thông tin dạng icon trên, text dưới */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 text-center text-gray-700">
        {/* 1 */}
        <div className="flex flex-col items-center">
          <FaPlaneDeparture className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Departure</p>
          <p className="text-[13px]">{departureLocation}</p>
        </div>

        {/* 2 */}
        <div className="flex flex-col items-center">
          <FaMapMarkerAlt className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Destination</p>
          <p className="text-[13px]">{destination}</p>
        </div>

        {/* 3 */}
        <div className="flex flex-col items-center">
          <FaCalendarAlt className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Start Date</p>
          <p className="text-[13px]">{startDate}</p>
        </div>

        {/* 4 */}
        <div className="flex flex-col items-center">
          <FaCalendarAlt className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">End Date</p>
          <p className="text-[13px]">{endDate}</p>
        </div>

        {/* 5 */}
        <div className="flex flex-col items-center">
          <FaClock className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Duration</p>
          <p className="text-[13px]">{durationDays} days</p>
        </div>

        {/* 6 */}
        <div className="flex flex-col items-center">
          <FaUsers className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Seats</p>
          <p className="text-[13px]">
            Limit {limitSeats} | Avail. {availableSeats}
          </p>
        </div>

        {/* 7 */}
        <div className="flex flex-col items-center">
          <FaUsers className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Adult Price</p>
          <p className="text-[13px]">{formatCurrency(priceAdult)}</p>
        </div>

        {/* 8 */}
        <div className="flex flex-col items-center">
          <FaChild className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Child Price</p>
          <p className="text-[13px]">{formatCurrency(priceChild)}</p>
        </div>

        {/* 9 */}
        <div className="flex flex-col items-center">
          <FaTags className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Discount</p>
          <p className="text-[13px]">-{percentDiscount}%</p>
        </div>

        {/* 10 */}
        <div className="flex flex-col items-center">
          <FaCheckCircle className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Status</p>
          <p className="text-[13px]">{status}</p>
        </div>

        {/* 11 */}
        <div className="flex flex-col items-center">
          <FaCalendarAlt className="text-orange-500 text-3xl mb-2" />
          <p className="text-sm font-medium">Created At</p>
          <p className="text-[13px]">{createdAt}</p>
        </div>
      </div>
    </section>
  );
}
