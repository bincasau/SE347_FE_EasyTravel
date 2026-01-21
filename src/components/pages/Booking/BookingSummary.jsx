import React, { useEffect, useMemo, useState } from "react";

// Format to VND currency
const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const S3_BASE = "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/tour";
const fallbackSrc = "/fallback.jpg";

export default function BookingSummary({ bookingData }) {
  const {
    tourId,
    tourInfo: tourInfoFromBooking,
    tickets = {},
    total,
    date,
  } = bookingData || {};

  const { adult = 0, child = 0 } = tickets;

  const [tourInfo, setTourInfo] = useState(tourInfoFromBooking || null);
  const [loading, setLoading] = useState(!tourInfoFromBooking && !!tourId);

  // ✅ ưu tiên id từ tourInfo (nếu có), fallback tourId
  const resolvedTourId = useMemo(() => {
    return tourInfoFromBooking?.tourId ??
      tourInfoFromBooking?.id ??
      tourInfoFromBooking?.tourID ??
      tourId ??
      null;
  }, [tourInfoFromBooking, tourId]);

  // ✅ giống TourCard: build primary src từ mainImage
  const buildPrimarySrc = (tour) => {
    const imageName = (tour?.mainImage ?? "").trim();

    if (!imageName) return ""; // không có -> để fallback
    if (imageName.startsWith("http")) return imageName;
    return `${S3_BASE}/${imageName}`;
  };

  // ✅ state ảnh (giống TourCard)
  const [imgSrc, setImgSrc] = useState(() => {
    const primary = buildPrimarySrc(tourInfoFromBooking);
    return primary || fallbackSrc;
  });

  // ✅ nếu bookingData có tourInfo thì dùng luôn, khỏi fetch
  useEffect(() => {
    if (tourInfoFromBooking) {
      setTourInfo(tourInfoFromBooking);

      const primary = buildPrimarySrc(tourInfoFromBooking);
      setImgSrc(primary || fallbackSrc);

      setLoading(false);
      return;
    }

    if (!tourId) return;

    const fetchTour = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8080/tours/${tourId}`);
        if (!res.ok) throw new Error("Failed to load tour data");
        const data = await res.json();

        setTourInfo(data);

        const primary = buildPrimarySrc(data);
        setImgSrc(primary || fallbackSrc);
      } catch (err) {
        console.error("❌ Error fetching tour:", err);
        setImgSrc(fallbackSrc);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [tourId, tourInfoFromBooking]);

  // ✅ nếu tourInfo đổi (fetch xong / đổi tour), reset ảnh theo mainImage
  useEffect(() => {
    const primary = buildPrimarySrc(tourInfo);
    setImgSrc(primary || fallbackSrc);
  }, [tourInfo, resolvedTourId]);

  if (loading)
    return (
      <aside className="rounded-2xl border bg-white shadow-sm p-5 h-fit sticky top-10 text-center text-gray-400 italic">
        Loading tour details...
      </aside>
    );

  if (!tourInfo) return null;

  const { title, destination, priceAdult, priceChild, percentDiscount = 0 } =
    tourInfo;

  const discountFactor = percentDiscount > 0 ? 1 - percentDiscount / 100 : 1;

  const effectiveAdult = (priceAdult ?? 0) * discountFactor;
  const effectiveChild = (priceChild ?? 0) * discountFactor;

  return (
    <aside className="rounded-2xl border bg-white shadow-sm p-5 h-fit sticky top-10">
      <h3 className="font-semibold text-gray-800 mb-4">Booking Information</h3>

      {/* 🖼️ Image + Tour details */}
      <div className="flex items-center gap-4 mb-5">
        <img
          src={imgSrc}
          alt={title}
          className="w-24 h-20 rounded-lg object-cover flex-shrink-0 border"
          loading="lazy"
          onError={() => {
            if (imgSrc === fallbackSrc) return;
            setImgSrc(fallbackSrc);
          }}
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
        </div>
      </div>

      <hr className="my-3" />

      {/* 🎟️ Ticket details */}
      <div className="space-y-2 text-sm">
        {adult > 0 && (
          <div className="flex justify-between items-center text-gray-700">
            <span>{adult} {adult > 1 ? "Adults" : "Adult"}</span>
            <div className="text-right">
              {percentDiscount > 0 && (
                <div className="text-xs text-gray-400 line-through">
                  {formatVND(adult * (priceAdult ?? 0))}
                </div>
              )}
              <div className="font-medium">
                {formatVND(adult * effectiveAdult)}
              </div>
            </div>
          </div>
        )}

        {child > 0 && (
          <div className="flex justify-between items-center text-gray-700">
            <span>{child} {child > 1 ? "Children" : "Child"}</span>
            <div className="text-right">
              {percentDiscount > 0 && (
                <div className="text-xs text-gray-400 line-through">
                  {formatVND(child * (priceChild ?? 0))}
                </div>
              )}
              <div className="font-medium">
                {formatVND(child * effectiveChild)}
              </div>
            </div>
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
