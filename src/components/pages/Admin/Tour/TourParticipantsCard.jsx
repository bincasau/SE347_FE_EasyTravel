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

export default function TourParticipantsCard({ tourId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!tourId) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await getTourParticipants(tourId);
        const list = Array.isArray(data) ? data : [];

        if (alive) setItems(list);
      } catch (e) {
        if (alive) {
          setErr(e?.message || "Không tải được danh sách người tham gia");
          setItems([]);
        }
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

    const totalAdults = success.reduce(
      (s, b) => s + (Number(b?.adults) || 0),
      0
    );
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
    <div className="rounded-2xl border bg-white p-5">
      {/* HEADER */}
      <div className="flex items-end justify-between gap-3 mb-3">
        <div className="text-lg font-semibold">Người đã đăng ký tour</div>

        <div className="text-sm text-gray-500 whitespace-nowrap">
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
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-sm text-gray-500">Đang tải danh sách...</div>
      ) : err ? (
        <div className="text-sm text-red-600">{err}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">
          Chưa có người nào đăng ký tour này.
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                          b?.status === "Success"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : b?.status === "Failed"
                            ? "bg-red-50 text-red-700 ring-red-200"
                            : "bg-gray-50 text-gray-700 ring-gray-200"
                        }`}
                      >
                        {b?.status ?? "-"}
                      </span>
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
      )}
    </div>
  );
}
