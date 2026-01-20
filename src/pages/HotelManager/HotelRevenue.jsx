import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import SummaryCards from "@/components/pages/HotelManager/HotelRevenue/SummaryCards";
import RevenueTable from "@/components/pages/HotelManager/HotelRevenue/RevenueTable";
import { popup } from "@/utils/popup"; // ✅ ADD

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

  // ✅ PDF mode + ref export
  const exportRef = useRef(null);
  const [pdfMode, setPdfMode] = useState(false);

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

  const monthLabel = useMemo(() => {
    // monthNum: 1-12
    return new Date(yearNum, monthNum - 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [monthNum, yearNum]);

  /** ✅ fetch bookings by month/year (JWT required) */
  const fetchBookingsByMonth = useCallback(
    async ({ month, year }) => {
      const url = `${API_BASE}/hotel_manager/bookings?month=${month}&year=${year}`;

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

  /** helpers tổng quan (để in lên PDF header) */
  const totalBookings = useMemo(() => sortedData.length, [sortedData]);

  const totalRevenue = useMemo(() => {
    const sum = sortedData.reduce((acc, b) => {
      const r = safeNumber(b?.payment?.totalPrice ?? b?.totalPrice ?? 0, 0);
      return acc + r;
    }, 0);
    return sum;
  }, [sortedData]);

  const totalRevenueText = useMemo(() => {
    return `${Math.round(totalRevenue).toLocaleString("vi-VN")}₫`;
  }, [totalRevenue]);

  /** ✅ Export PDF */
  const exportPDF = async () => {
    try {
      if (!exportRef.current) return popup.error("Không tìm thấy vùng để export!");
      if (loading) return popup.error("Đang tải dữ liệu, thử lại sau nhé!");
      if (!token) return popup.error("Bạn chưa đăng nhập!");

      const ok = await popup.confirm(
        `Xuất báo cáo doanh thu tháng ${monthLabel} ra PDF?`,
        "Xác nhận"
      );
      if (!ok) return;

      // bật layout PDF (title giữa + ẩn filter)
      setPdfMode(true);

      // đợi render ổn định
      await new Promise((r) => setTimeout(r, 350));

      const el = exportRef.current;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Hotel_Revenue_${monthLabel}.pdf`);
      popup.success("Export PDF thành công!");
    } catch (e) {
      console.error(e);
      popup.error(e?.message || "Export PDF failed!");
    } finally {
      setPdfMode(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ✅ VÙNG EXPORT PDF */}
      <div ref={exportRef} className="bg-white">
        {/* ✅ Header PDF (title giữa) */}
        {pdfMode && (
          <div className="px-6 pt-8 pb-4 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">HOTEL REVENUE</h1>
            <div className="text-sm text-gray-600 mt-1">{monthLabel}</div>
            <div className="text-xs text-gray-500 mt-1">
              Total bookings: {totalBookings} · Total revenue: {totalRevenueText}
            </div>
            <div className="mt-4 h-px bg-gray-200" />
          </div>
        )}

        {/* HEADER UI (ẩn khi pdfMode) */}
        {!pdfMode && (
          <div className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-6 py-6">
              <h1 className="text-2xl font-semibold text-gray-900 text-center">
                Hotel Revenue
              </h1>
              <p className="text-sm text-gray-500 text-center mt-1">
                Booking revenue by month
              </p>

              {/* Filters */}
              <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
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

                <button
                  onClick={exportPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm disabled:opacity-60"
                  disabled={loading}
                >
                  Export PDF
                </button>
              </div>

              <div className="mt-3 text-center text-xs text-gray-500">
                {loading ? "Đang tải dữ liệu..." : error ? `Lỗi: ${error}` : ""}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <SummaryCards data={sortedData} />
          <RevenueTable data={sortedData} />
        </div>

        {/* Footer PDF */}
        {pdfMode && (
          <div className="px-6 pb-6 text-center text-xs text-gray-400">
            Generated by EasyTravel · {new Date().toLocaleString("vi-VN")}
          </div>
        )}
      </div>
      {/* ✅ END EXPORT */}
    </div>
  );
}
