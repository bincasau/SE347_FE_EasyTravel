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

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function pickUsernameFromPayload(p) {
  if (!p) return "";
  return (
    p.username ||
    p.userName ||
    p.preferred_username ||
    p.sub ||
    p.email ||
    ""
  );
}

/** parse response mọi kiểu: Map | Array | text */
function parseStatsAny(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return {
      bookings: safeNumber(raw.totalBookings ?? 0),
      revenue: safeNumber(raw.totalRevenue ?? 0),
    };
  }

  if (Array.isArray(raw)) {
    return {
      bookings: safeNumber(raw?.[0] ?? 0),
      revenue: safeNumber(raw?.[1] ?? 0),
    };
  }

  if (typeof raw === "string") {
    const nums = raw
      .split(/[,\n\r\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((x) => Number.isFinite(x));

    return {
      bookings: safeNumber(nums?.[0] ?? 0),
      revenue: safeNumber(nums?.[1] ?? 0),
    };
  }

  return { bookings: 0, revenue: 0 };
}

export default function RevenueReport() {
  /** ===== State ===== */
  const [month, setMonth] = useState(12);
  const [year, setYear] = useState(2025);

  const [username, setUsername] = useState(""); // dùng ngầm, KHÔNG hiển thị
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

  /** ===== resolve username (ngầm) ===== */
  useEffect(() => {
    let alive = true;

    const run = async () => {
      const payload = decodeJwt(token);
      const fromJwt = pickUsernameFromPayload(payload);

      if (fromJwt) {
        if (alive) setUsername(fromJwt);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/hotel_manager/test-user`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        const txt = await res.text();
        const m = txt.match(/Username hiện tại là:\s*(.+)$/i);
        const u = m?.[1]?.trim() || "";
        if (alive) setUsername(u);
      } catch {
        if (alive) setUsername("");
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [token]);

  /** ===== fetch stats ===== */
  const fetchStatsByMonth = useCallback(
    async ({ username, month, year }) => {
      const url = `${API_BASE}/hotel-bookings/search/getStatsByMonth?username=${encodeURIComponent(
        username
      )}&month=${month}&year=${year}&_t=${Date.now()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const ct = res.headers.get("content-type") || "";
      let raw;

      if (ct.includes("application/json")) {
        raw = await res.json().catch(async () => await res.text());
      } else {
        raw = await res.text();
      }

      if (!res.ok) {
        throw new Error(typeof raw === "string" ? raw : JSON.stringify(raw));
      }

      return parseStatsAny(raw);
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
        if (!username) throw new Error("Không lấy được username");

        const cur = await fetchStatsByMonth({
          username,
          month: safeMonth,
          year: safeYear,
        });
        if (alive) setStats(cur);

        try {
          const prev = await fetchStatsByMonth({
            username,
            month: prevParams.pm,
            year: prevParams.py,
          });
          if (alive) setPrevStats(prev);
        } catch {
          if (alive) setPrevStats(null);
        }
      } catch (e) {
        if (alive) setError(e?.message || "Fetch failed");
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [
    username,
    token,
    safeMonth,
    safeYear,
    prevParams.pm,
    prevParams.py,
    fetchStatsByMonth,
  ]);

  const changePercent = useMemo(() => {
    if (!prevStats || !prevStats.revenue) return null;
    return (
      ((stats.revenue - prevStats.revenue) / prevStats.revenue) *
      100
    ).toFixed(1);
  }, [stats.revenue, prevStats]);

  const revenueText = useMemo(() => {
    return `${safeNumber(stats.revenue, 0).toLocaleString("vi-VN")}₫`;
  }, [stats.revenue]);

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
    csv += `Bookings,${stats.bookings}\n`;
    csv += `Total Revenue,${stats.revenue}\n`;
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

          {/* ✅ BỎ DÒNG user/bookings/revenue dưới header */}
          {/* Nếu bạn muốn giữ "Doanh thu: xxx" thôi thì nói mình, mình thêm đúng 1 dòng gọn */}
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
            <div className="text-sm text-gray-600 mt-2 break-words">
              {error}
            </div>
          </div>
        ) : (
          <ComparisonText
            revenue={stats.revenue}
            changePercent={changePercent}
            bookings={stats.bookings}
            revenueText={revenueText}
          />
        )}
      </div>
    </div>
  );
}
