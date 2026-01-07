import { useMemo, useEffect, useState, useCallback } from "react";
import SummaryCards from "@/components/pages/HotelManager/HotelRevenue/SummaryCards";
import RevenueTable from "@/components/pages/HotelManager/HotelRevenue/RevenueTable";

const API_BASE = "http://localhost:8080";

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function HotelRevenue() {
  /** type="month" => "YYYY-MM" */
  const [monthValue, setMonthValue] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });

  const [sortBy, setSortBy] = useState("revenue_desc");
  const [data, setData] = useState([]); // ✅ array bookings (raw.content)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  /** Convert "YYYY-MM" -> monthNum/yearNum */
  const { monthNum, yearNum } = useMemo(() => {
    const [y, m] = String(monthValue || "").split("-");
    return {
      yearNum: Math.trunc(safeNumber(y, new Date().getFullYear())),
      monthNum: Math.trunc(safeNumber(m, new Date().getMonth() + 1)),
    };
  }, [monthValue]);

  /** ✅ fetch bookings by month/year (JWT required) */
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

      console.log("[HotelRevenue] GET", { url, status: res.status, ct, raw });

      if (!res.ok) {
        throw new Error(typeof raw === "string" ? raw : JSON.stringify(raw));
      }

      return Array.isArray(raw?.content) ? raw.content : [];
    },
    [token]
  );

  /** load theo tháng */
  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) throw new Error("NO_TOKEN (Bạn chưa đăng nhập)");

        const bookings = await fetchBookingsByMonth({
          month: monthNum,
          year: yearNum,
        });

        if (alive) setData(bookings);
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
  }, [token, monthNum, yearNum, fetchBookingsByMonth]);

  /** sort (gọn) */
  const sortedData = useMemo(() => {
    const arr = [...data];

    const getRevenue = (b) =>
      safeNumber(b?.payment?.totalPrice ?? b?.totalPrice ?? 0, 0);

    switch (sortBy) {
      case "revenue_desc":
        return arr.sort((a, b) => getRevenue(b) - getRevenue(a));
      case "revenue_asc":
        return arr.sort((a, b) => getRevenue(a) - getRevenue(b));
      case "checkin_desc":
        return arr.sort(
          (a, b) => new Date(b?.checkInDate || 0) - new Date(a?.checkInDate || 0)
        );
      case "checkin_asc":
        return arr.sort(
          (a, b) => new Date(a?.checkInDate || 0) - new Date(b?.checkInDate || 0)
        );
      default:
        return arr;
    }
  }, [data, sortBy]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Hotel Revenue
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Booking revenue by month
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
              <option value="checkin_desc">Check-in: New → Old</option>
              <option value="checkin_asc">Check-in: Old → New</option>
            </select>
          </div>

          <div className="mt-3 text-center text-xs text-gray-500">
            {loading ? "Đang tải dữ liệu..." : error ? `Lỗi: ${error}` : ""}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <SummaryCards data={sortedData} />
        <RevenueTable data={sortedData} />
      </div>
    </div>
  );
}
