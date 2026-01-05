import { useMemo, useEffect, useState, useCallback } from "react";
import SummaryCards from "@/components/pages/HotelManager/HotelRevenue/SummaryCards";
import RevenueTable from "@/components/pages/HotelManager/HotelRevenue/RevenueTable";

const API_BASE = "http://localhost:8080";

/** ===== Helpers giống RevenueReport ===== */
function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
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

export default function HotelRevenue() {
  /** type="month" => "YYYY-MM" */
  const [monthValue, setMonthValue] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });

  const [sortBy, setSortBy] = useState("revenue_desc");

  const [username, setUsername] = useState("");
  const [data, setData] = useState([]); // data thật
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  /** ✅ Convert "YYYY-MM" -> monthNum/yearNum */
  const { monthNum, yearNum } = useMemo(() => {
    const [y, m] = String(monthValue || "").split("-");
    return {
      yearNum: Math.trunc(safeNumber(y, new Date().getFullYear())),
      monthNum: Math.trunc(safeNumber(m, new Date().getMonth() + 1)),
    };
  }, [monthValue]);

  /** 1) resolve username y chang RevenueReport */
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

  /** 2) fetch statsByMonth */
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
      let raw = null;

      if (ct.includes("application/json")) {
        raw = await res.json().catch(async () => await res.text());
      } else {
        raw = await res.text();
      }

      // ✅ Log để bạn nhìn ra sai chỗ nào ngay
      console.log("[HotelRevenue] GET", { url, status: res.status, ct, raw });

      if (!res.ok) {
        throw new Error(typeof raw === "string" ? raw : JSON.stringify(raw));
      }

      return parseStatsAny(raw);
    },
    [token]
  );

  /** 3) load theo tháng */
  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) throw new Error("NO_TOKEN (Bạn chưa đăng nhập)");
        if (!username) return; // ✅ đợi username set xong rồi fetch

        const stats = await fetchStatsByMonth({
          username,
          month: monthNum,
          year: yearNum,
        });

        // ✅ API chỉ trả tổng -> tạo 1 dòng “ALL”
        const rows = [
          {
            room_id: 0,
            room_number: "ALL",
            room_type: "All rooms",
            bookings: stats.bookings,
            nights: 0,
            revenue: stats.revenue,
          },
        ];

        if (alive) setData(rows);
      } catch (e) {
        if (alive) setError(e?.message || "Fetch failed");
        if (alive) setData([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [token, username, monthNum, yearNum, fetchStatsByMonth]);

  /** sort */
  const sortedData = useMemo(() => {
    const arr = [...data];
    switch (sortBy) {
      case "revenue_desc":
        return arr.sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
      case "revenue_asc":
        return arr.sort((a, b) => (a.revenue ?? 0) - (b.revenue ?? 0));
      case "bookings_desc":
        return arr.sort((a, b) => (b.bookings ?? 0) - (a.bookings ?? 0));
      default:
        return arr;
    }
  }, [data, sortBy]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Hotel Revenue
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Revenue performance by room
          </p>

          {/* Filters */}
          <div className="mt-6 flex justify-center gap-4">
            <input
              type="month"
              value={monthValue}
              onChange={(e) => setMonthValue(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="revenue_desc">Revenue: High → Low</option>
              <option value="revenue_asc">Revenue: Low → High</option>
              <option value="bookings_desc">Bookings: High → Low</option>
            </select>
          </div>

          <div className="mt-3 text-center text-xs text-gray-500">
            {loading ? "Đang tải dữ liệu..." : error ? `Lỗi: ${error}` : ""}
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <SummaryCards data={sortedData} />
        <RevenueTable data={sortedData} />
      </div>
    </div>
  );
}
