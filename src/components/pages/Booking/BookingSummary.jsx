import React, { useEffect, useState } from "react";
import imgFallback from "../../../assets/images/Tour/Booking.jpg";

// Format to VND currency
const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function BookingSummary({ bookingData }) {
  const { tourId, tickets = {}, total, date, time } = bookingData || {};
  const { adult = 0, child = 0 } = tickets;
  const [tourInfo, setTourInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImageUrl, setMainImageUrl] = useState(imgFallback);

  // ✅ Fetch tour info (title, image, prices)
  useEffect(() => {
    if (!tourId) return;
    const fetchTour = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${tourId}`);
        if (!res.ok) throw new Error("Failed to load tour data");
        const data = await res.json();
        setTourInfo(data);
        if (data.mainImage) {
          setMainImageUrl(`http://localhost:8080/images/${data.mainImage}`);
        }
      } catch (err) {
        console.error("❌ Error fetching tour:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [tourId]);

  if (loading)
    return (
      <aside className="rounded-2xl border bg-white shadow-sm p-5 h-fit sticky top-10 text-center text-gray-400 italic">
        Loading tour information...
      </aside>
    );

  if (!tourInfo) return null;

  const { title, destination, priceAdult, priceChild } = tourInfo;

  return (
    <aside className="rounded-2xl border bg-white shadow-sm p-5 h-fit sticky top-10">
      <h3 className="font-semibold text-gray-800 mb-4">
        Booking Information
      </h3>

      {/* 🖼️ Image + Tour details side by side */}
      <div className="flex items-center gap-4 mb-5">
        <img
          src={mainImageUrl}
          alt={title}
          className="w-24 h-20 rounded-lg object-cover flex-shrink-0 border"
          onError={(e) => (e.currentTarget.src = imgFallback)}
        />
        <div className="flex flex-col justify-center">
          <div className="font-semibold text-gray-800 text-sm leading-tight mb-1">
            {title}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            📍 <span>{destination}</span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            📅 <span>{date || "--"}</span>
          </div>
          {time && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              🕒 <span>{time}</span>
            </div>
          )}
        </div>
      </div>

      <hr className="my-3" />

      {/* 🎟️ Ticket details */}
      <div className="space-y-2 text-sm">
        {adult > 0 && (
          <div className="flex justify-between items-center text-gray-700">
            <span>
              {adult} {adult > 1 ? "Adults" : "Adult"}
            </span>
            <span className="font-medium">
              {formatVND(adult * priceAdult)}
            </span>
          </div>
        )}
        {child > 0 && (
          <div className="flex justify-between items-center text-gray-700">
            <span>
              {child} {child > 1 ? "Children" : "Child"}
            </span>
            <span className="font-medium">
              {formatVND(child * priceChild)}
            </span>
          </div>
        )}
      </div>

      <hr className="my-4" />

      {/* 💰 Total */}
      <div className="flex justify-between items-center">
        <span className="text-gray-700 font-semibold">Total</span>
        <span className="text-orange-500 font-bold text-lg">
          {formatVND(total)}
        </span>
      </div>
    </aside>
  );
}
