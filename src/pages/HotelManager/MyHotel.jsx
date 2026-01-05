import React, { useMemo, useEffect, useState } from "react";

const HOTEL_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/hotel";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80&auto=format&fit=crop";

export default function MyHotel() {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ format backend -> UI keys (camelCase -> snake_case)
  const normalizeHotel = (raw) => {
    if (!raw) return null;
    return {
      hotel_id: raw.hotel_id ?? raw.hotelId ?? raw.id,
      name: raw.name ?? "",
      address: raw.address ?? "",
      phone_number: raw.phone_number ?? raw.phoneNumber ?? "",
      email: raw.email ?? "",
      description: raw.description ?? "",
      main_image: raw.main_image ?? raw.mainImage ?? "",
      min_price: raw.min_price ?? raw.minPrice ?? null,
      created_at: raw.created_at ?? raw.createdAt ?? null,
      updated_at: raw.updated_at ?? raw.updatedAt ?? null,
      images: Array.isArray(raw.images) ? raw.images : [],
    };
  };

  /** ===============================
   *  LOAD HOTEL FROM JWT
   * =============================== */
  useEffect(() => {
    const token =
      localStorage.getItem("jwt") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    const loadHotel = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:8080/hotel_manager/my-hotel", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          // nếu backend dùng cookie session thì bật cái này:
          // credentials: "include",
        });

        if (!res.ok) {
          let msg = `Request failed: ${res.status}`;
          try {
            const e = await res.json();
            msg = e?.message || e?.error || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();
        setHotel(normalizeHotel(data));
      } catch (err) {
        setError(err?.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    };

    loadHotel();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Đang tải thông tin khách sạn...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white border rounded-2xl p-6">
          <div className="text-lg font-semibold text-gray-900">Lỗi</div>
          <div className="text-sm text-gray-600 mt-2 break-words">{error}</div>

          <button
            className="mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Không có dữ liệu khách sạn.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">My Hotel</h1>
          <p className="text-sm text-gray-500 mt-1">Hotel Information</p>
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

          {/* ✅ Quick Info: đã bỏ Hotel ID + Main image */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-900 mb-3">
              Quick Info
            </div>

            <Row label="Email" value={hotel?.email} />
            <Row label="Phone" value={hotel?.phone_number} />
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
