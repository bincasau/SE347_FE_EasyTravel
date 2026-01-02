import React, { useMemo, useState } from "react";

const HOTEL_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80&auto=format&fit=crop";

export default function MyHotel() {
  // ✅ MOCK DATA để xem UI/UX
  const [hotel] = useState({
    hotel_id: 2,
    name: "EasyTravel Hotel Da Nang",
    address: "123 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
    description:
      "Khách sạn nằm gần biển, phòng rộng rãi, dịch vụ tốt.\n\n- Check-in: 14:00\n- Check-out: 12:00\n- Có hồ bơi & buffet sáng",
    email: "easytravel.danang@example.com",
    phone_number: "0901 234 567",
    main_image: "", // để trống -> dùng fallback (hoặc thay bằng filename thật trên S3)
    min_price: 450000,
    created_at: "2024-09-01T10:30:00",
    updated_at: "2024-09-15T16:20:00",
  });

  const formatDate = (d) => {
    if (!d) return "--";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleString("vi-VN");
  };

  const priceText = useMemo(() => {
    const v = hotel?.min_price ?? hotel?.minPrice;
    if (v === null || v === undefined || v === "") return "--";
    const num = Number(v);
    if (Number.isNaN(num)) return String(v);
    return `${num.toLocaleString("vi-VN")}₫ / đêm`;
  }, [hotel]);

  const mainImage = hotel?.main_image ?? hotel?.mainImage;
  const mainImageUrl = mainImage
    ? `${HOTEL_IMAGE_BASE}/${mainImage}`
    : FALLBACK_IMAGE;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">My Hotel</h1>
          <p className="text-sm text-gray-500 mt-1">
           Hotel Information
          </p>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: IMAGE + QUICK */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <img
              src={mainImageUrl}
              alt={hotel?.name || "Hotel"}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            <div className="p-5">
              <div className="text-xl font-semibold text-gray-900">
                {hotel?.name || "--"}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {hotel?.address || "--"}
              </div>

              <div className="mt-4 text-orange-600 font-bold text-xl">
                {priceText}
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-900 mb-3">
              Quick Info
            </div>

            <Row label="Hotel ID" value={hotel?.hotel_id} />
            <Row label="Email" value={hotel?.email} />
            <Row label="Phone" value={hotel?.phone_number} />
            <Row label="Main image" value={mainImage || "(using fallback image)"} />
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Description
            </h2>

            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {hotel?.description || "--"}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              System Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="Created at" value={formatDate(hotel?.created_at)} />
              <InfoCard title="Updated at" value={formatDate(hotel?.updated_at)} />
              <InfoCard title="Min price" value={priceText} />
              <InfoCard title="Address" value={hotel?.address || "--"} />
            </div>
          </div>

          {/* OPTIONAL: thêm section contact cho đẹp */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="Email" value={hotel?.email || "--"} />
              <InfoCard title="Phone number" value={hotel?.phone_number || "--"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm text-gray-800 font-medium text-right break-all">
        {value === null || value === undefined || value === "" ? "--" : value}
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-sm font-semibold text-gray-900 mt-1 break-words">
        {value === null || value === undefined || value === "" ? "--" : value}
      </div>
    </div>
  );
}
