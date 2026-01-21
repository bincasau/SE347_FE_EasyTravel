import { useMemo, useEffect, useState, useCallback, useRef, useReducer } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getToken, isLoggedIn } from "@/utils/auth";

import RoomTypePie from "@/components/pages/HotelManager/RevenueReports/RoomTypePie.jsx";
import ComparisonText from "@/components/pages/HotelManager/RevenueReports/ComparisonText.jsx";
import { popup } from "@/utils/popup";

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

// normalize response /hotel_manager/stats
function normalizeStats(raw) {
  return {
    allTypeRevenue: safeNumber(raw?.allTypeRevenue, 0),
    allTypeBookings: safeNumber(raw?.allTypeBookings, 0),
    details: Array.isArray(raw?.details) ? raw.details : [],
  };
}

/** ✅ current month/year */
function getNowYM() {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

/** ✅ reducer month+year atomically */
function ymReducer(state, action) {
  switch (action.type) {
    case "PREV": {
      if (state.month === 1) return { month: 12, year: state.year - 1 };
      return { month: state.month - 1, year: state.year };
    }
    case "NEXT": {
      if (state.month === 12) return { month: 1, year: state.year + 1 };
      return { month: state.month + 1, year: state.year };
    }
    case "SET_MONTH": {
      const m = clampInt(action.month, 1, 12, state.month);
      return { month: m, year: state.year };
    }
    case "SET_YEAR": {
      const y = clampInt(action.year, 1970, 2100, state.year);
      return { month: state.month, year: y };
    }
    case "SET_YM": {
      const m = clampInt(action.month, 1, 12, state.month);
      const y = clampInt(action.year, 1970, 2100, state.year);
      return { month: m, year: y };
    }
    default:
      return state;
  }
}

export default function RevenueReport() {
  /** ✅ init = current month/year */
  const nowYM = useMemo(() => getNowYM(), []);
  const [{ month, year }, dispatch] = useReducer(ymReducer, nowYM);

  // ✅ draft year (string để nhập không bị giật)
  const [draftYear, setDraftYear] = useState(String(nowYM.year));

  const [stats, setStats] = useState(null);
  const [prevStats, setPrevStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ vùng để chụp PDF
  const exportRef = useRef(null);

  // ✅ bật layout riêng cho PDF
  const [pdfMode, setPdfMode] = useState(false);

  const token = getToken();

  const safeMonth = useMemo(() => clampInt(month, 1, 12, nowYM.month), [month, nowYM.month]);
  const safeYear = useMemo(() => clampInt(year, 1970, 2100, nowYM.year), [year, nowYM.year]);

  /** ✅ giới hạn không cho vượt quá tháng hiện tại */
  const isCurrentOrFuture = useMemo(() => {
    // true nếu đang là tháng hiện tại hoặc tương lai (tương lai thì chặn)
    if (safeYear > nowYM.year) return true;
    if (safeYear === nowYM.year && safeMonth >= nowYM.month) return true;
    return false;
  }, [safeMonth, safeYear, nowYM.month, nowYM.year]);

  const canGoNext = useMemo(() => {
    // chỉ cho next nếu vẫn < tháng hiện tại
    if (safeYear < nowYM.year) return true;
    if (safeYear === nowYM.year) return safeMonth < nowYM.month;
    return false;
  }, [safeMonth, safeYear, nowYM.month, nowYM.year]);

  // ✅ commit draftYear -> year (và nếu vượt hiện tại thì kéo month về tháng hiện tại)
  const commitDraftYear = useCallback(() => {
    const trimmed = String(draftYear ?? "").trim();
    if (trimmed === "") {
      setDraftYear(String(safeYear));
      return;
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n)) {
      setDraftYear(String(safeYear));
      return;
    }
    const y = clampInt(n, 1970, 2100, safeYear);

    // nếu user nhập year tương lai -> clamp về year hiện tại
    const finalYear = Math.min(y, nowYM.year);

    // nếu cùng year hiện tại mà month đang > current month -> kéo về current month
    const finalMonth =
      finalYear === nowYM.year ? Math.min(safeMonth, nowYM.month) : safeMonth;

    dispatch({ type: "SET_YM", year: finalYear, month: finalMonth });
    setDraftYear(String(finalYear));
  }, [draftYear, safeYear, safeMonth, nowYM.year, nowYM.month]);

  // ✅ sync draftYear khi year change
  useEffect(() => {
    setDraftYear(String(safeYear));
  }, [safeYear]);

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

  /** ✅ Prev/Next month */
  const goPrevMonth = useCallback(() => {
    dispatch({ type: "PREV" });
  }, []);

  const goNextMonth = useCallback(() => {
    if (!canGoNext) return;
    dispatch({ type: "NEXT" });
  }, [canGoNext]);

  /** ✅ fetch stats by month/year */
  const fetchStatsByMonth = useCallback(
    async ({ month, year }) => {
      const url = `${API_BASE}/hotel_manager/stats?month=${month}&year=${year}&_t=${Date.now()}`;

      const res = await fetch(url, {
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

      console.log("[RevenueReport] GET", { url, status: res.status, ct, raw });

      if (!res.ok) {
        throw new Error(typeof raw === "string" ? raw : JSON.stringify(raw));
      }

      return normalizeStats(raw);
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

        const cur = await fetchStatsByMonth({ month: safeMonth, year: safeYear });
        if (alive) setStats(cur);

        try {
          const prev = await fetchStatsByMonth({
            month: prevParams.pm,
            year: prevParams.py,
          });
          if (alive) setPrevStats(prev);
        } catch {
          if (alive) setPrevStats(null);
        }
      } catch (e) {
        if (alive) setError(e?.message || "Fetch failed");
        if (alive) {
          setStats(null);
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
  }, [token, safeMonth, safeYear, prevParams.pm, prevParams.py, fetchStatsByMonth]);

  const revenueText = useMemo(() => {
    const r = safeNumber(stats?.allTypeRevenue, 0);
    return `${r.toLocaleString("vi-VN")}₫`;
  }, [stats]);

  const bookings = useMemo(() => safeNumber(stats?.allTypeBookings, 0), [stats]);

  const avgRevenueText = useMemo(() => {
    const r = safeNumber(stats?.allTypeRevenue, 0);
    const b = safeNumber(stats?.allTypeBookings, 0);
    const avg = b > 0 ? Math.round(r / b) : 0;
    return `${avg.toLocaleString("vi-VN")}₫`;
  }, [stats]);

  const changePercent = useMemo(() => {
    const cur = safeNumber(stats?.allTypeRevenue, 0);
    const prev = safeNumber(prevStats?.allTypeRevenue, 0);
    if (!prevStats || prev <= 0) return null;
    const pct = ((cur - prev) / prev) * 100;
    return Number.isFinite(pct) ? Number(pct.toFixed(1)) : null;
  }, [stats, prevStats]);

  // ✅ Export CSV
  const exportCSV = async () => {
    if (!isLoggedIn()) return popup.error("You are not logged in!");
    if (loading) return popup.error("Loading data, please try again!");
    if (!stats) return popup.error("No data to export.");

    const ok = await popup.confirm(`Export revenue report for ${monthLabel} to CSV?`, "Confirm");
    if (!ok) return;

    const curRevenue = safeNumber(stats?.allTypeRevenue, 0);
    const curBookings = safeNumber(stats?.allTypeBookings, 0);

    let csv = "Metric,Value\n";
    csv += `Month,${monthLabel}\n`;
    csv += `Bookings,${curBookings}\n`;
    csv += `Total Revenue,${curRevenue}\n`;
    csv += `Avg/Booking,${curBookings > 0 ? Math.round(curRevenue / curBookings) : 0}\n`;
    csv += `Change vs last month,${changePercent ?? "N/A"}%\n`;

    csv += `\nRoomType,Count,Revenue\n`;
    (stats?.details || []).forEach((d) => {
      csv += `${d.roomType},${safeNumber(d.count, 0)},${safeNumber(d.revenue, 0)}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Revenue_Report_${monthLabel}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    popup.success("CSV export successful!");
  };

  /** ✅ Export PDF */
  const exportPDF = async () => {
    try {
      if (!isLoggedIn()) return popup.error("You are not logged in!");
      if (loading) return popup.error("Loading data, please try again!");
      if (!stats) return popup.error("No data to export.");
      if (!exportRef.current) return popup.error("Cannot find export region!");

      const ok = await popup.confirm(`Export revenue report for ${monthLabel} to PDF?`, "Confirm");
      if (!ok) return;

      setPdfMode(true);
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

      pdf.save(`Revenue_Report_${monthLabel}.pdf`);
      popup.success("PDF export successful!");
    } catch (e) {
      console.error(e);
      popup.error(e?.message || "Export PDF failed!");
    } finally {
      setPdfMode(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div ref={exportRef} className="bg-white">
        {pdfMode && (
          <div className="px-4 sm:px-6 pt-8 pb-4 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">REVENUE REPORT</h1>
            <div className="text-sm text-gray-600 mt-1">{monthLabel}</div>
            <div className="text-xs text-gray-500 mt-1">
              Total Revenue: {revenueText} · Bookings: {bookings} · Avg/Booking: {avgRevenueText}
            </div>
            <div className="mt-4 h-px bg-gray-200" />
          </div>
        )}

        {!pdfMode && (
          <div className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
              <h1 className="text-2xl font-semibold text-gray-900 text-center">Revenue Report</h1>
              <p className="text-sm text-gray-500 text-center mt-1">
                Room distribution & monthly comparison
              </p>

              <div className="mt-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    onClick={goPrevMonth}
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  >
                    ← Prev
                  </button>

                  <span className="font-medium text-sm sm:text-base whitespace-nowrap">
                    {monthLabel}
                  </span>

                  <button
                    onClick={goNextMonth}
                    disabled={!canGoNext}
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    title={!canGoNext ? "Cannot view future months" : ""}
                  >
                    Next →
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center lg:justify-end gap-3">
                  <select
                    className="border rounded-lg px-3 py-2 text-sm bg-white w-full sm:w-auto"
                    value={safeMonth}
                    onChange={(e) => {
                      const m = Number(e.target.value);

                      // nếu chọn month vượt current month trong current year -> clamp về current month
                      if (safeYear === nowYM.year && m > nowYM.month) {
                        dispatch({ type: "SET_MONTH", month: nowYM.month });
                        return;
                      }
                      dispatch({ type: "SET_MONTH", month: m });
                    }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => {
                      const m = i + 1;
                      const disabled = safeYear === nowYM.year && m > nowYM.month;
                      return (
                        <option key={m} value={m} disabled={disabled}>
                          Month {m}
                        </option>
                      );
                    })}
                  </select>

                  <input
                    className="border rounded-lg px-3 py-2 text-sm w-full sm:w-32"
                    type="text"
                    inputMode="numeric"
                    value={draftYear}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d*$/.test(v)) setDraftYear(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                        commitDraftYear();
                      }
                    }}
                    onBlur={commitDraftYear}
                    placeholder="Year"
                  />

                  <button
                    onClick={exportCSV}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-60 w-full sm:w-auto"
                    disabled={!stats || loading}
                  >
                    Export CSV
                  </button>

                  <button
                    onClick={exportPDF}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-60 w-full sm:w-auto"
                    disabled={!stats || loading}
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className={[
            "max-w-6xl mx-auto px-4 sm:px-6",
            pdfMode ? "py-6" : "py-8 sm:py-10",
            pdfMode ? "grid grid-cols-1 gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8",
          ].join(" ")}
        >
          {loading ? (
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="text-gray-600">Đang tải biểu đồ...</div>
            </div>
          ) : (
            <RoomTypePie stats={stats} />
          )}

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
              revenueText={revenueText}
              bookings={bookings}
              avgRevenueText={avgRevenueText}
              changePercent={changePercent}
            />
          )}
        </div>

        {pdfMode && (
          <div className="px-4 sm:px-6 pb-6 text-center text-xs text-gray-400">
            Generated by EasyTravel · {new Date().toLocaleString("vi-VN")}
          </div>
        )}
      </div>
    </div>
  );
}
