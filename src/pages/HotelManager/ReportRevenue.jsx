import { useMemo, useEffect, useState, useCallback } from "react";
import RoomTypePie from "@/components/pages/HotelManager/RevenueReports/RoomTypePie.jsx";
import ComparisonText from "@/components/pages/HotelManager/RevenueReports/ComparisonText.jsx";

const API_BASE = "http://localhost:8080";

/** ===== Helpers ===== */
function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clampInt(n, min, max, fallback) {
  const x = Math.trunc(safeNumber(n, fallback));
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

function calcStatsFromBookings(bookings = []) {
  // ✅ chỉ tính SUCCESS cho hợp lý doanh thu
  const success = bookings.filter(
    (b) =>
      String(b?.status || "").toLowerCase() === "success" ||
      String(b?.payment?.status || "").toLowerCase() === "success"
  );

  const bookingsCount = success.length;

  const revenue = success.reduce((sum, b) => {
    const v = b?.payment?.totalPrice ?? b?.totalPrice ?? 0;
    return sum + safeNumber(v, 0);
  }, 0);

  return { bookings: bookingsCount, revenue };
}

export default function RevenueReport() {
  /** ===== State ===== */
  const [month, setMonth] = useState(12);
  const [year, setYear] = useState(2025);

  const [stats, setStats] = useState({ bookings: 0, revenue: 0 });
  const [prevStats, setPrevStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const safeMonth = useMemo(() => clampInt(month, 1, 12, 1), [month]);
  const safeYear = useMemo(() => clampInt(year, 1970, 2100, 2025), [year]);

  const monthLabel = useMemo(() => {
    return new Date(safeYear, safeMonth - 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [safeMonth, safeYear]);

  const prevParams = useMemo(() => {
    let pm = safeMonth - 1;
    let py = safeYear;
    if (pm <= 0) {
      pm = 12;
      py = safeYear - 1;
    }
    return { pm, py };
  }, [safeMonth, safeYear]);

  /** ===== fetch bookings by month/year (JWT) ===== */
  const fetchBookingsByMonth = useCallback(
    async ({ month, year }) => {
      const url = `${API_BASE}/hotel_manager/bookings?month=${month}&year=${year}&_t=${Date.now()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const ct = res.headers.get("content-type") || "";
      const raw = ct.includes("application/json")
        ? await res.json().catch(async () => await res.text())
        : await res.text();

      console.log("[RevenueReport] GET", { url, status: res.status, ct, raw });

      if (!res.ok) {
        throw new Error(typeof raw === "string" ? raw : JSON.stringify(raw));
      }

      return Array.isArray(raw?.content) ? raw.content : [];
    },
    [token]
  );

  /** ===== load current + prev ===== */
  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) throw new Error("NO_TOKEN (Bạn chưa đăng nhập)");

        // current month
        const curBookings = await fetchBookingsByMonth({
          month: safeMonth,
          year: safeYear,
        });
        const curStats = calcStatsFromBookings(curBookings);
        if (alive) setStats(curStats);

        // prev month
        try {
          const prevBookings = await fetchBookingsByMonth({
            month: prevParams.pm,
            year: prevParams.py,
          });
          const pStats = calcStatsFromBookings(prevBookings);
          if (alive) setPrevStats(pStats);
        } catch {
          if (alive) setPrevStats(null);
        }
      } catch (e) {
        if (alive) setError(e?.message || "Fetch failed");
        if (alive) {
          setStats({ bookings: 0, revenue: 0 });
          setPrevStats(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [token, safeMonth, safeYear, prevParams.pm, prevParams.py, fetchBookingsByMonth]);

  const changePercent = useMemo(() => {
    if (!prevStats || !prevStats.revenue) return null;
    const pct = ((stats.revenue - prevStats.revenue) / prevStats.revenue) * 100;
    return Number.isFinite(pct) ? Number(pct.toFixed(1)) : null;
  }, [stats.revenue, prevStats]);

  const revenueText = useMemo(() => {
    return `${safeNumber(stats.revenue, 0).toLocaleString("vi-VN")}₫`;
  }, [stats.revenue]);

  const avgRevenueText = useMemo(() => {
    const avg =
      stats.bookings > 0 ? Math.round(stats.revenue / stats.bookings) : 0;
    return `${safeNumber(avg, 0).toLocaleString("vi-VN")}₫`;
  }, [stats.revenue, stats.bookings]);

  // (giữ demo distribution như bạn đang làm)
  const roomDistribution = useMemo(() => {
    if (!stats.revenue || stats.revenue <= 0) {
      return [
        { type: "Deluxe", value: 0 },
        { type: "Standard", value: 0 },
        { type: "Suite", value: 0 },
      ];
    }
    return [
      { type: "Deluxe", value: 45 },
      { type: "Standard", value: 35 },
      { type: "Suite", value: 20 },
    ];
  }, [stats.revenue]);

  const exportCSV = () => {
    let csv = "Metric,Value\n";
    csv += `Month,${monthLabel}\n`;
    csv += `Bookings(Success),${stats.bookings}\n`;
    csv += `Total Revenue(Success),${stats.revenue}\n`;
    csv += `Avg/Booking,${stats.bookings > 0 ? Math.round(stats.revenue / stats.bookings) : 0}\n`;
    csv += `Change vs last month,${changePercent ?? "N/A"}%\n`;

    csv += `\nRoom Type,Percentage\n`;
    roomDistribution.forEach((r) => {
      csv += `${r.type},${r.value}%\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Revenue_Report_${monthLabel}.csv`;
    a.click();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Revenue Report
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Room distribution & monthly comparison
          </p>

          <div className="mt-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setMonth((m) => {
                    const mm = clampInt(m, 1, 12, 1);
                    if (mm === 1) {
                      setYear((y) => clampInt(y, 1970, 2100, 2025) - 1);
                      return 12;
                    }
                    return mm - 1;
                  });
                }}
                className="px-3 py-1 border rounded"
              >
                ← Prev
              </button>

              <span className="font-medium">{monthLabel}</span>

              <button
                onClick={() => {
                  setMonth((m) => {
                    const mm = clampInt(m, 1, 12, 1);
                    if (mm === 12) {
                      setYear((y) => clampInt(y, 1970, 2100, 2025) + 1);
                      return 1;
                    }
                    return mm + 1;
                  });
                }}
                className="px-3 py-1 border rounded"
              >
                Next →
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                className="border rounded px-2 py-1"
                value={safeMonth}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const m = i + 1;
                  return (
                    <option key={m} value={m}>
                      Month {m}
                    </option>
                  );
                })}
              </select>

              <input
                className="border rounded px-2 py-1 w-28"
                type="number"
                value={safeYear}
                onChange={(e) => setYear(Number(e.target.value))}
              />

              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <RoomTypePie data={roomDistribution} />

        {loading ? (
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="text-gray-600">Đang tải thống kê...</div>
          </div>
        ) : error ? (
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="text-lg font-semibold text-gray-900">Lỗi</div>
            <div className="text-sm text-gray-600 mt-2 break-words">{error}</div>
          </div>
        ) : (
          <ComparisonText
            revenueText={revenueText}      // ✅ tổng tiền
            bookings={stats.bookings}      // ✅ số booking success
            avgRevenueText={avgRevenueText} // ✅ revenue/booking
            changePercent={changePercent}
          />
        )}
      </div>
    </div>
  );
}
