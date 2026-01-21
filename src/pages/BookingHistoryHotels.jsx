import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchHotelBookingHistory } from "@/apis/bookingHistory";
import { buildTourSlug } from "@/utils/slug";
import { popup } from "@/utils/popup";

const BASE_URL = "http://localhost:8080";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ✅ Refund HOTEL theo bookingId (JWT ở cookie -> chỉ cần include credentials)
async function refundByBooking(bookingType, bookingId) {
  return fetchJSON(`${BASE_URL}/payment/refund/${bookingType}/${bookingId}`, {
    method: "POST",
    credentials: "include", // ✅ gửi cookie
    headers: {
      Accept: "application/json",
    },
  });
}

// ✅ random delay 1-3s
const sleepRandom = (min, max) =>
  new Promise((resolve) =>
    setTimeout(resolve, Math.random() * (max - min) + min)
  );

const fmtDate = (d) => {
  if (!d) return "-";
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

/* =========================
   ✅ Extract message helper
========================= */
function extractMessage(input, fallback = "Có lỗi xảy ra!") {
  if (input == null) return fallback;

  if (typeof input === "object" && !(input instanceof Error)) {
    return (
      input?.message ||
      input?.msg ||
      input?.error ||
      input?.detail ||
      input?.title ||
      fallback
    );
  }

  const raw =
    input instanceof Error
      ? input.message
      : typeof input === "string"
      ? input
      : "";

  const s = String(raw || "").trim();
  if (!s) return fallback;

  try {
    const obj = JSON.parse(s);
    if (typeof obj === "string") return obj;
    if (obj && typeof obj === "object") {
      return (
        obj?.message ||
        obj?.msg ||
        obj?.error ||
        obj?.detail ||
        obj?.title ||
        fallback
      );
    }
  } catch {
    // ignore
  }

  return s;
}

/* =========================
   ✅ Date compare: checkOut < today ?
   - so sánh theo NGÀY (00:00)
========================= */
function parseDateOnly(value) {
  if (!value) return null;
  const s = String(value).trim();

  const ymd = s.length >= 10 ? s.slice(0, 10) : s;
  const parts = ymd.split("-");
  if (parts.length !== 3) return null;

  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return null;

  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

function isCheckoutPast(checkOutDate) {
  const co = parseDateOnly(checkOutDate);
  if (!co) return false;
  return co.getTime() < startOfToday().getTime();
}

export default function BookingHistoryHotels() {
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(5);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [refundingId, setRefundingId] = useState(null);

  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
  });

  // ✅ sort: booking gần nhất lên đầu
  const rows = [...(data.content || [])].sort((a, b) => {
    const da = new Date(
      a?.createdAt || a?.bookingDate || a?.checkInDate || 0
    ).getTime();
    const db = new Date(
      b?.createdAt || b?.bookingDate || b?.checkInDate || 0
    ).getTime();
    return db - da;
  });

  const notifySuccess = (msg) => {
    const text = extractMessage(msg, "Thành công!");
    if (popup && typeof popup.success === "function") popup.success(text);
    else alert(text);
  };

  const notifyError = (msg) => {
    const text = extractMessage(msg, "Có lỗi xảy ra!");
    if (popup && typeof popup.error === "function") popup.error(text);
    else alert(text);
  };

  const confirmRefund = async (msg) => {
    if (popup && typeof popup.confirm === "function")
      return await popup.confirm(msg);
    return window.confirm(msg);
  };

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
      notifyError(e);
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

  // ✅ CHỈ SUCCESS + checkOut >= today mới refund
  // ✅ refund xong vẫn ở nguyên trang hiện tại (reload đúng page hiện tại)
  const onRefund = async (bookingId, status, checkOutDate) => {
    if (!bookingId) return;

    const st = String(status || "").trim().toLowerCase();
    if (st !== "success") {
      notifyError("Chỉ booking có trạng thái SUCCESS mới được refund.");
      return;
    }

    if (isCheckoutPast(checkOutDate)) {
      notifyError("Booking đã quá ngày check-out nên không thể refund.");
      return;
    }

    const ok = await confirmRefund(
      `Bạn có chắc muốn refund tiền cho booking #${bookingId} không?`
    );
    if (!ok) return;

    setRefundingId(bookingId);

    const closeLoading =
      popup && typeof popup.loading === "function"
        ? popup.loading("Đang refund...")
        : null;

    try {
      await sleepRandom(1000, 3000);

      const res = await refundByBooking("HOTEL", bookingId);

      if (typeof closeLoading === "function") closeLoading();

      notifySuccess(extractMessage(res, "Refund khách sạn thành công!"));

      // ✅ reload lại đúng trang hiện tại
      load(page);
    } catch (e) {
      console.error(e);

      if (typeof closeLoading === "function") closeLoading();

      notifyError(e);

      // ✅ nếu muốn: vẫn reload lại trang hiện tại để sync dữ liệu
      // load(page);
    } finally {
      setRefundingId(null);
    }
  };

  const canPrev = page > 0;
  const canNext = page + 1 < (data.totalPages || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Hotel booking history</h1>

        <div className="flex items-center gap-2">
          <NavLink
            to="/booking-history/tours"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl border ${
                isActive
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white"
              }`
            }
          >
            Tours
          </NavLink>
          <NavLink
            to="/booking-history/hotels"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl border ${
                isActive
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white"
              }`
            }
          >
            Hotels
          </NavLink>
        </div>
      </div>

      {/* Filters */}
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

      {/* Cards */}
      <div className="mt-6">
        {loading ? (
          <div className="p-6 text-gray-500">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-6 bg-white border rounded-2xl text-gray-500">
            No hotel bookings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {rows.map((r, idx) => {
              const hotel = r?.hotel;
              const room = r?.room;

              const bookingId = r?.bookingId ?? null;

              const hotelName = hotel?.name || "Hotel";
              const hotelId = hotel?.hotelId ?? hotel?.id ?? null;
              const roomType = room?.roomType || room?.type || "Room";

              const checkIn = fmtDate(r?.checkInDate);
              const checkOutRaw = r?.checkOutDate;
              const checkOut = fmtDate(checkOutRaw);

              const total = r?.totalPrice ?? 0;
              const status = r?.status || "Pending";

              const isSuccess =
                String(status).trim().toLowerCase() === "success";
              const isPastCheckout = isCheckoutPast(checkOutRaw);

              const hotelSlug = hotelId
                ? buildTourSlug(Number(hotelId), String(hotelName))
                : null;

              const isRefunding = refundingId === bookingId;

              // ✅ điều kiện refund (đồng bộ với disabled)
              const canRefund =
                Boolean(bookingId) &&
                isSuccess &&
                !isPastCheckout &&
                !isRefunding &&
                !loading;

              const refundTitle = !bookingId
                ? "Thiếu bookingId"
                : !isSuccess
                ? "Chỉ booking trạng thái SUCCESS mới được refund"
                : isPastCheckout
                ? "Đã quá ngày check-out nên không thể refund"
                : "Refund booking";

              return (
                <div
                  key={bookingId ?? `${hotelId || "hotel"}-${idx}`}
                  className="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm"
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
                      {isPastCheckout ? (
                        <span className="ml-2 text-xs text-red-600 font-medium">
                          (Past)
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>{" "}
                      <span className="text-orange-600 font-semibold">
                        {formatVND(total)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    {hotelSlug ? (
                      <a
                        href={`/detailhotel/${hotelSlug}`}
                        className="text-orange-600 hover:underline text-sm font-medium"
                      >
                        View hotel detail →
                      </a>
                    ) : (
                      <span />
                    )}

                    <button
                      disabled={!canRefund}
                      onClick={() => onRefund(bookingId, status, checkOutRaw)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-50 ${
                        canRefund ? "hover:bg-gray-50" : "cursor-not-allowed"
                      }`}
                      title={refundTitle}
                    >
                      {isRefunding ? "Refunding..." : "Refund"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
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
