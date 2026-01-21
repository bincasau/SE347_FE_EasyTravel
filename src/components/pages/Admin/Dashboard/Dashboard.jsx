// src/pages/Admin/AdminDashboard.jsx
import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getToken, isLoggedIn } from "@/utils/auth";
import { popup } from "@/utils/popup";

const API_BASE = "http://localhost:8080";
const API_URL = `${API_BASE}/admin/stats`; // <-- đổi nếu endpoint khác

function formatVND(n) {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return String(n ?? "0");
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

/** map revenueLast6Months => [{m:"Aug", v:62}, ...] */
function mapRevenueLast6Months(revenueLast6Months) {
  const order = ["AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER", "JANUARY"];
  const label = {
    AUGUST: "Aug",
    SEPTEMBER: "Sep",
    OCTOBER: "Oct",
    NOVEMBER: "Nov",
    DECEMBER: "Dec",
    JANUARY: "Jan",
  };

  const vals = order.map((k) => Number(revenueLast6Months?.[k] ?? 0));
  const max = Math.max(...vals, 0);

  // percent mock bar theo max (nếu max=0 thì all 0)
  return order.map((k, i) => ({
    m: label[k] ?? k,
    raw: vals[i],
    v: max > 0 ? Math.round((vals[i] / max) * 100) : 0,
  }));
}

export default function AdminDashboard() {
  const token = getToken();

  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    const res = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    const ct = res.headers.get("content-type") || "";
    const raw = ct.includes("application/json")
      ? await res.json().catch(async () => await res.text())
      : await res.text();

    console.log("[AdminDashboard] GET", { url: API_URL, status: res.status, ct, raw });

    if (!res.ok) {
      throw new Error(typeof raw === "string" ? raw : JSON.stringify(raw));
    }
    return raw;
  }, [token]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        if (!isLoggedIn()) {
          setDash(null);
          setLoading(false);
          return;
        }

        const data = await fetchDashboard();
        if (alive) setDash(data);
      } catch (e) {
        if (alive) {
          setError(e?.message || "Fetch failed");
          setDash(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [fetchDashboard]);

  /** ===== Derived UI data ===== */
  const kpis = useMemo(() => {
    const x = dash || {};
    return [
      { label: "Activated Tours", value: x.totalToursActive ?? 0 },
      { label: "Passed Tours", value: x.totalToursPassed ?? 0 },
      { label: "Canceled Tours", value: x.totalToursCanceled ?? 0 },
      { label: "Total Hotels", value: x.totalHotels ?? 0 },
      { label: "Bookings This Month", value: x.totalBookingsThisMonth ?? 0 },
      {
        label: "Revenue This Month",
        value: formatVND(x.totalRevenueThisMonth ?? 0),
        sub: loading ? "Loading..." : "Updated just now",
      },
      {
        label: "Admins",
        value: x.countAdmin ?? 0,
      },
      {
        label: "Customers",
        value: x.countCustomer ?? 0,
      },
      {
        label: "Tour Guides",
        value: x.countTourGuide ?? 0,
      },
      {
        label: "Hotel Managers",
        value: x.countHotelManager ?? 0,
      },
    ];
  }, [dash, loading]);

  const revenue = useMemo(() => {
    return mapRevenueLast6Months(dash?.revenueLast6Months);
  }, [dash]);

  const tourStatus = useMemo(() => {
    return [
      { label: "Activated", value: dash?.totalToursActive ?? 0, tone: "green" },
      { label: "Passed", value: dash?.totalToursPassed ?? 0, tone: "blue" },
      { label: "Cancelled", value: dash?.totalToursCanceled ?? 0, tone: "red" },
      // Nếu BE có Pending thì add vào đây
    ];
  }, [dash]);

  const upcomingTours = useMemo(() => {
    return Array.isArray(dash?.upcomingActiveTours) ? dash.upcomingActiveTours : [];
  }, [dash]);

  const recentNotis = useMemo(() => {
    return Array.isArray(dash?.broadcastNotifications) ? dash.broadcastNotifications : [];
  }, [dash]);

  /** ===== UI ===== */
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview admin {!loading && error ? "• Error" : ""}
          </p>
          {error ? (
            <div className="mt-2 text-sm text-red-600 break-words">{error}</div>
          ) : null}
          {!isLoggedIn() ? (
            <div className="mt-2 text-sm text-yellow-700">
              Bạn chưa đăng nhập.
            </div>
          ) : null}
        </div>

        {/* QUICK ACTIONS (top) */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
          <Link to="/admin/tours/new" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-orange-600 transition">
              + Add Tour
            </button>
          </Link>
          <Link to="/admin/hotels/add" className="w-full sm:w-auto">
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
        {kpis.slice(0, 5).map((x, idx) => (
          <KpiCard key={idx} label={x.label} value={x.value} sub={x.sub} />
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue */}
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
                  <div className="w-24 text-sm text-gray-500 text-right shrink-0">
                    {formatVND(r.raw)}
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-400 mt-2">
                (Bar theo % của tháng cao nhất)
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
                <div key={s.label} className="flex items-center justify-between gap-3">
                  <Badge tone={s.tone}>{s.label}</Badge>
                  <div className="text-sm font-semibold text-gray-900">
                    {s.value}
                  </div>
                </div>
              ))}
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
                  <tr key={t.tourId} className="border-t border-gray-100">
                    <td className="py-3 pr-2">
                      <div className="font-semibold text-gray-900 line-clamp-1">
                        {t.title}
                      </div>
                      <div className="text-xs text-gray-400">ID: {t.tourId}</div>
                    </td>
                    <td className="py-3 pr-2 text-gray-700">{t.startDate}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      {t.availableSeats}
                    </td>
                  </tr>
                ))}

                {!loading && upcomingTours.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-500">
                      No upcoming tours
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Broadcast Notifications */}
        <Panel
          title="Broadcast Notifications"
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
              <div key={n.notificationId} className="border border-gray-100 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Mã: {n.notificationId}
                    </span>

                    <Badge tone="purple">Broadcast</Badge>

                    <Badge tone={n.read ? "gray" : "yellow"}>
                      {n.read ? "Đã đọc" : "Chưa đọc"}
                    </Badge>

                    <Badge tone={n.status === "ACTIVE" ? "green" : "red"}>
                      {n.status === "ACTIVE" ? "Đang kích hoạt" : "Tắt kích hoạt"}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-400 whitespace-nowrap sm:text-right">
                    {String(n.createdAt ?? "")}
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-800 break-words">
                  {n.message}
                </div>
              </div>
            ))}

            {!loading && recentNotis.length === 0 ? (
              <div className="text-sm text-gray-500">No notifications</div>
            ) : null}
          </div>
        </Panel>
      </div>

      {/* QUICK ACTIONS (bottom) */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-base font-semibold text-gray-900">Quick Actions</div>
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

            <button
              onClick={async () => {
                try {
                  if (!isLoggedIn()) return popup.error("Bạn chưa đăng nhập!");
                  setLoading(true);
                  const data = await fetchDashboard();
                  setDash(data);
                  popup.success("Reload dashboard OK!");
                } catch (e) {
                  popup.error(e?.message || "Reload failed");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full sm:w-auto border border-gray-300 text-gray-700 px-5 py-2 rounded-full font-semibold hover:bg-gray-50 transition"
            >
              Reload
            </button>
          </div>
        </div>
      </div>

      {/* EXTRA KPI ROW (optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {kpis.slice(5, 10).map((x, idx) => (
          <KpiCard key={idx} label={x.label} value={x.value} sub={x.sub} />
        ))}
      </div>
    </div>
  );
}
