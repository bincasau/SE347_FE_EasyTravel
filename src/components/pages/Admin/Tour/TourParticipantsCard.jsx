// src/components/pages/admin/Tour/TourParticipantsCard.jsx
import { useEffect, useMemo, useState } from "react";
import { getTourParticipants } from "@/apis/Tour";

function formatDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("vi-VN");
}

function formatMoney(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("vi-VN");
}

function StatusBadge({ value }) {
  const s = value ?? "-";
  const cls =
    s === "Success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : s === "Failed"
      ? "bg-red-50 text-red-700 ring-red-200"
      : "bg-gray-50 text-gray-700 ring-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${cls}`}
    >
      {s}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900 break-words">
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, right }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-sm font-medium text-gray-900 ${right ? "text-right" : ""}`}>
        {value}
      </div>
    </div>
  );
}

export default function TourParticipantsCard({ tourId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    if (!tourId) return;
    setLoading(true);
    setErr("");
    try {
      const data = await getTourParticipants(tourId);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Không tải được danh sách người tham gia");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    if (!tourId) return;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getTourParticipants(tourId);
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Không tải được danh sách người tham gia");
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [tourId]);

  const summary = useMemo(() => {
    const success = items.filter((b) => b?.status === "Success");

    const totalAdults = success.reduce((s, b) => s + (Number(b?.adults) || 0), 0);
    const totalChildren = success.reduce(
      (s, b) => s + (Number(b?.children) || 0),
      0
    );

    const totalRevenue = success.reduce(
      (s, b) => s + (Number(b?.totalPrice) || 0),
      0
    );

    return {
      totalBookings: items.length,
      totalPeople: totalAdults + totalChildren,
      totalRevenue,
    };
  }, [items]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-lg font-semibold">Người đã đăng ký tour</div>
          <div className="mt-2 grid grid-cols-3 gap-3 sm:hidden">
            <Stat label="Tổng đơn" value={summary.totalBookings} />
            <Stat label="Khách (Success)" value={summary.totalPeople} />
            <Stat
              label="Doanh thu"
              value={`${formatMoney(summary.totalRevenue)} VND`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="hidden sm:block text-sm text-gray-500 whitespace-nowrap">
            Tổng đơn:{" "}
            <span className="text-gray-900 font-semibold">
              {summary.totalBookings}
            </span>
            {" · "}
            Khách (Success):{" "}
            <span className="text-gray-900 font-semibold">
              {summary.totalPeople}
            </span>
            {" · "}
            Doanh thu:{" "}
            <span className="text-gray-900 font-semibold">
              {formatMoney(summary.totalRevenue)} VND
            </span>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading || !tourId}
            className="px-4 py-2 rounded-xl ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60 text-sm font-semibold"
          >
            {loading ? "Đang tải..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-sm text-gray-500">Đang tải danh sách...</div>
      ) : err ? (
        <div className="text-sm text-red-700 bg-red-50 ring-1 ring-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">
          Chưa có người nào đăng ký tour này.
        </div>
      ) : (
        <>
          {/* MOBILE: cards */}
          <div className="space-y-3 lg:hidden">
            {items.map((b) => {
              const u = b?.user ?? {};
              return (
                <div
                  key={b?.bookingId}
                  className="rounded-2xl border border-gray-200 p-4 bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 break-words">
                        {u?.name || "-"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {u?.email || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {u?.phoneNumber || "-"}
                      </div>
                    </div>
                    <StatusBadge value={b?.status} />
                  </div>

                  <div className="mt-3 space-y-2">
                    <Row label="Ngày đặt" value={formatDate(b?.bookingDate)} />
                    <Row label="Người lớn" value={b?.adults ?? 0} right />
                    <Row label="Trẻ em" value={b?.children ?? 0} right />
                    <Row
                      label="Tổng tiền"
                      value={`${formatMoney(b?.totalPrice)} VND`}
                      right
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP: table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left min-w-[220px]">Người đặt</th>
                  <th className="px-3 py-2 text-left min-w-[220px]">Email</th>
                  <th className="px-3 py-2 text-left min-w-[140px]">SĐT</th>
                  <th className="px-3 py-2 text-left min-w-[120px]">Ngày đặt</th>
                  <th className="px-3 py-2 text-left min-w-[110px]">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2 text-right min-w-[90px]">Người lớn</th>
                  <th className="px-3 py-2 text-right min-w-[90px]">Trẻ em</th>
                  <th className="px-3 py-2 text-right min-w-[140px]">
                    Tổng tiền
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((b) => {
                  const u = b?.user ?? {};
                  return (
                    <tr
                      key={b?.bookingId}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-3 py-2 min-w-[220px]">
                        <div className="font-medium text-gray-900 whitespace-nowrap">
                          {u?.name || "-"}
                        </div>
                      </td>

                      <td className="px-3 py-2 min-w-[220px] whitespace-nowrap">
                        {u?.email || "-"}
                      </td>

                      <td className="px-3 py-2 min-w-[140px] whitespace-nowrap">
                        {u?.phoneNumber || "-"}
                      </td>

                      <td className="px-3 py-2 min-w-[120px] whitespace-nowrap">
                        {formatDate(b?.bookingDate)}
                      </td>

                      <td className="px-3 py-2 min-w-[110px] whitespace-nowrap">
                        <StatusBadge value={b?.status} />
                      </td>

                      <td className="px-3 py-2 text-right min-w-[90px] whitespace-nowrap">
                        {b?.adults ?? 0}
                      </td>

                      <td className="px-3 py-2 text-right min-w-[90px] whitespace-nowrap">
                        {b?.children ?? 0}
                      </td>

                      <td className="px-3 py-2 text-right min-w-[140px] whitespace-nowrap">
                        {formatMoney(b?.totalPrice)} VND
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
