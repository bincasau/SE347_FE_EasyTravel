// src/pages/Admin/AdminDashboard.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

function formatVND(n) {
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return String(n ?? "0");
  return v.toLocaleString("vi-VN") + " đ";
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-5">
      <div className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-gray-600">{label}</div>
      {sub ? <div className="mt-2 text-xs text-gray-400">{sub}</div> : null}
    </div>
  );
}

function Panel({ title, right, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <div className="shrink-0">{right}</div>
      </div>
      {children}
    </div>
  );
}

function Badge({ children, tone = "gray" }) {
  const cls =
    tone === "green"
      ? "bg-green-100 text-green-700"
      : tone === "yellow"
      ? "bg-yellow-100 text-yellow-700"
      : tone === "red"
      ? "bg-red-100 text-red-700"
      : tone === "blue"
      ? "bg-blue-100 text-blue-700"
      : tone === "purple"
      ? "bg-purple-100 text-purple-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

function MiniBar({ value = 50 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-2 bg-orange-500" style={{ width: `${v}%` }} />
    </div>
  );
}

export default function AdminDashboard() {
  // ===================== MOCK DATA =====================
  const kpis = useMemo(
    () => [
      { label: "Total Tours", value: 128, sub: "+12% vs last month" },
      { label: "Total Users", value: 542, sub: "+3% vs last month" },
      { label: "Total Hotels", value: 32, sub: "Stable" },
      { label: "Bookings Today", value: 18, sub: "Last 24h" },
      {
        label: "Revenue This Month",
        value: formatVND(125000000),
        sub: "Updated 5 mins ago",
      },
    ],
    []
  );

  const revenue = useMemo(
    () => [
      { m: "Aug", v: 62 },
      { m: "Sep", v: 48 },
      { m: "Oct", v: 75 },
      { m: "Nov", v: 58 },
      { m: "Dec", v: 82 },
      { m: "Jan", v: 66 },
    ],
    []
  );

  const tourStatus = useMemo(
    () => [
      { label: "Activated", value: 45, tone: "green" },
      { label: "Passed", value: 32, tone: "blue" },
      { label: "Pending", value: 18, tone: "yellow" },
      { label: "Cancelled", value: 3, tone: "red" },
    ],
    []
  );

  const upcomingTours = useMemo(
    () => [
      {
        id: 1,
        title: "Hạ Long - Kỳ Quan Thiên Nhiên",
        start: "2025-12-14",
        seats: "5/30",
      },
      {
        id: 2,
        title: "Ngũ Hành Sơn - Phố Cổ Hội An",
        start: "2025-12-20",
        seats: "0/25",
      },
      {
        id: 3,
        title: "Sapa - Chinh phục nóc nhà Đông Dương",
        start: "2025-12-25",
        seats: "2/20",
      },
      {
        id: 4,
        title: "Ninh Bình - Tràng An - Bái Đính",
        start: "2025-12-28",
        seats: "12/20",
      },
      {
        id: 5,
        title: "Đà Lạt - Thành phố ngàn hoa",
        start: "2026-01-05",
        seats: "7/25",
      },
    ],
    []
  );

  const recentNotis = useMemo(
    () => [
      {
        id: 31,
        type: "User",
        status: "Unread",
        active: true,
        createdAt: "15/01/2026 22:52",
        message:
          'Tour "12132" đã bị huỷ. Hệ thống sẽ tự động hoàn tiền cho đơn đặt tour của bạn.',
      },
      {
        id: 29,
        type: "User",
        status: "Unread",
        active: true,
        createdAt: "15/01/2026 22:41",
        message: "1111",
      },
      {
        id: 28,
        type: "Broadcast",
        status: "Read",
        active: false,
        createdAt: "14/01/2026 09:10",
        message: "Hệ thống sẽ bảo trì lúc 23:30 hôm nay.",
      },
    ],
    []
  );

  // ===================== UI =====================
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview admin (mock UI)
          </p>
        </div>

        {/* QUICK ACTIONS (top) */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
          <Link to="/admin/tours/new" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-orange-600 transition">
              + Add Tour
            </button>
          </Link>
          <Link to="/admin/hotels/new" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-orange-600 transition">
              + Add Hotel
            </button>
          </Link>
          <Link to="/admin/users/new" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-orange-600 transition">
              + Add User
            </button>
          </Link>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {kpis.map((x, idx) => (
          <KpiCard key={idx} label={x.label} value={x.value} sub={x.sub} />
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue (mock bars) */}
        <div className="lg:col-span-2">
          <Panel
            title="Revenue (Last 6 Months)"
            right={
              <Link to="/admin/tours">
                <button className="border border-orange-500 text-orange-500 px-4 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition text-sm font-semibold w-full sm:w-auto">
                  View Tours
                </button>
              </Link>
            }
          >
            <div className="space-y-4">
              {revenue.map((r) => (
                <div key={r.m} className="flex items-center gap-3">
                  <div className="w-12 text-sm text-gray-600 font-semibold shrink-0">
                    {r.m}
                  </div>
                  <div className="flex-1 min-w-0">
                    <MiniBar value={r.v} />
                  </div>
                  <div className="w-10 text-sm text-gray-500 text-right shrink-0">
                    {r.v}%
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-400 mt-2">
                (Mock chart) — sau này thay bằng chart lib nếu muốn.
              </div>
            </div>
          </Panel>
        </div>

        {/* Status */}
        <div className="lg:col-span-1">
          <Panel
            title="Tour Status"
            right={
              <Link to="/admin/tours">
                <button className="border border-orange-500 text-orange-500 px-4 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition text-sm font-semibold w-full sm:w-auto">
                  Manage
                </button>
              </Link>
            }
          >
            <div className="space-y-3">
              {tourStatus.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between gap-3"
                >
                  <Badge tone={s.tone}>{s.label}</Badge>
                  <div className="text-sm font-semibold text-gray-900">
                    {s.value}
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <div className="text-xs text-gray-400">
                  Gợi ý: dùng Pie/Donut chart khi có thời gian.
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* TABLE + NOTIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Tours */}
        <Panel
          title="Upcoming Tours"
          right={
            <Link to="/admin/tours">
              <button className="border border-orange-500 text-orange-500 px-4 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition text-sm font-semibold w-full sm:w-auto">
                Open
              </button>
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-2 font-semibold">Tour</th>
                  <th className="py-2 pr-2 font-semibold">Start</th>
                  <th className="py-2 font-semibold text-right">Seats</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTours.map((t) => (
                  <tr key={t.id} className="border-t border-gray-100">
                    <td className="py-3 pr-2">
                      <div className="font-semibold text-gray-900 line-clamp-1">
                        {t.title}
                      </div>
                      <div className="text-xs text-gray-400">ID: {t.id}</div>
                    </td>
                    <td className="py-3 pr-2 text-gray-700">{t.start}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      {t.seats}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Recent Notifications */}
        <Panel
          title="Recent Notifications"
          right={
            <Link to="/admin/notifications">
              <button className="border border-orange-500 text-orange-500 px-4 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition text-sm font-semibold w-full sm:w-auto">
                Open
              </button>
            </Link>
          }
        >
          <div className="space-y-4">
            {recentNotis.map((n) => (
              <div
                key={n.id}
                className="border border-gray-100 rounded-xl p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Mã: {n.id}
                    </span>

                    <Badge tone={n.type === "Broadcast" ? "purple" : "blue"}>
                      {n.type === "Broadcast"
                        ? "Gửi broadcast"
                        : "Gửi theo người dùng"}
                    </Badge>

                    <Badge tone={n.status === "Unread" ? "yellow" : "gray"}>
                      {n.status === "Unread" ? "Chưa đọc" : "Đã đọc"}
                    </Badge>

                    <Badge tone={n.active ? "green" : "red"}>
                      {n.active ? "Đang kích hoạt" : "Tắt kích hoạt"}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-400 whitespace-nowrap sm:text-right">
                    {n.createdAt}
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-800 break-words">
                  {n.message}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* QUICK ACTIONS (bottom) */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-base font-semibold text-gray-900">
              Quick Actions
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Điều hướng nhanh tới các trang quản lý.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
            <Link to="/admin/tours" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border border-orange-500 text-orange-500 px-5 py-2 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition">
                Tours
              </button>
            </Link>
            <Link to="/admin/users" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border border-orange-500 text-orange-500 px-5 py-2 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition">
                Users
              </button>
            </Link>
            <Link to="/admin/hotels" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border border-orange-500 text-orange-500 px-5 py-2 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition">
                Hotels
              </button>
            </Link>
            <Link to="/admin/notifications" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border border-orange-500 text-orange-500 px-5 py-2 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition">
                Notifications
              </button>
            </Link>
            <Link to="/admin/blogs" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border border-orange-500 text-orange-500 px-5 py-2 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition">
                Blogs
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
