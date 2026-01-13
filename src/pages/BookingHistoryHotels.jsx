import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchHotelBookingHistory } from "@/apis/bookingHistory";
import { buildTourSlug } from "@/utils/slug";

const fmtDate = (d) => {
  if (!d) return "-";
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function BookingHistoryHotels() {
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(8);

  // ✅ lọc ngày check-in/check-out (backend đang filter theo repo findMyHistoryFullInfo)
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
  });

  const rows = data.content || [];

  const load = async (overridePage) => {
    const p = typeof overridePage === "number" ? overridePage : page;
    setLoading(true);
    try {
      const res = await fetchHotelBookingHistory({ page: p, size, start, end });
      setData({
        content: res?.content || [],
        totalPages: res?.totalPages ?? 0,
        totalElements: res?.totalElements ?? 0,
        number: res?.number ?? p,
      });
    } catch (e) {
      console.error(e);
      setData({ content: [], totalPages: 0, totalElements: 0, number: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const onApplyFilter = () => {
    setPage(0);
    load(0);
  };

  const onClearFilter = () => {
    setStart("");
    setEnd("");
    setPage(0);
    setTimeout(() => load(0), 0);
  };

  const canPrev = page > 0;
  const canNext = page + 1 < (data.totalPages || 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Hotel booking history</h1>

        <div className="flex items-center gap-2">
          <NavLink
            to="/booking-history/tours"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl border ${
                isActive ? "bg-orange-500 text-white border-orange-500" : "bg-white"
              }`
            }
          >
            Tours
          </NavLink>
          <NavLink
            to="/booking-history/hotels"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl border ${
                isActive ? "bg-orange-500 text-white border-orange-500" : "bg-white"
              }`
            }
          >
            Hotels
          </NavLink>
        </div>
      </div>

      {/* ✅ Filters */}
      <div className="mt-5 bg-white border rounded-2xl p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col md:flex-row gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Start date</div>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">End date</div>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <button
            onClick={onApplyFilter}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2"
          >
            Apply
          </button>

          <button
            onClick={onClearFilter}
            className="border rounded-xl px-4 py-2"
          >
            Clear
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {loading ? "Loading..." : `${data.totalElements || 0} record(s)`}
        </div>
      </div>

      {/* ✅ Cards (ĐÃ BỎ BOOKING ID) */}
      <div className="mt-6">
        {loading ? (
          <div className="p-6 text-gray-500">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-6 bg-white border rounded-2xl text-gray-500">
            No hotel bookings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rows.map((r, idx) => {
              const hotel = r?.hotel; // object
              const room = r?.room;   // object

              const hotelName = hotel?.name || "Hotel";
              const hotelId = hotel?.hotelId ?? hotel?.id ?? null;
              const roomType = room?.roomType || room?.type || "Room";

              const checkIn = fmtDate(r?.checkInDate);
              const checkOut = fmtDate(r?.checkOutDate);
              const total = r?.totalPrice ?? 0;
              const status = r?.status || "Pending";

              const hotelSlug =
                hotelId ? buildTourSlug(Number(hotelId), String(hotelName)) : null;

              return (
                <div
                  key={r?.bookingId ?? `${hotelId || "hotel"}-${idx}`}
                  className="bg-white border rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-lg font-semibold text-gray-800">
                      {hotelName}
                    </div>

                    <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                      {status}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    Room: <span className="font-medium">{roomType}</span>
                  </div>

                  <div className="mt-2 text-sm text-gray-600 flex flex-col gap-1">
                    <div>
                      <span className="font-medium">Check-in:</span> {checkIn}
                    </div>
                    <div>
                      <span className="font-medium">Check-out:</span> {checkOut}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>{" "}
                      <span className="text-orange-600 font-semibold">
                        {formatVND(total)}
                      </span>
                    </div>
                  </div>

                  {hotelSlug && (
                    <div className="mt-4">
                      <a
                        href={`/detailhotel/${hotelSlug}`}
                        className="text-orange-600 hover:underline text-sm font-medium"
                      >
                        View hotel detail →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-4 py-2 rounded-xl border disabled:opacity-50"
          >
            Prev
          </button>

          <div className="text-sm text-gray-700">
            Page <span className="font-semibold">{page + 1}</span> /{" "}
            <span className="font-semibold">{data.totalPages}</span>
          </div>

          <button
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
