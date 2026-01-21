import { useMemo, useEffect, useState, useCallback, useRef, useReducer } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getToken, isLoggedIn } from "@/utils/auth";

import RoomTypePie from "@/components/pages/HotelManager/RevenueReports/RoomTypePie.jsx";
import ComparisonText from "@/components/pages/HotelManager/RevenueReports/ComparisonText.jsx";
import { popup } from "@/utils/popup";

const API_BASE = "http://localhost:8080";

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function clampInt(n, min, max, fallback) {
  const x = Math.trunc(safeNumber(n, fallback));
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

function normalizeStats(raw) {
  return {
    allTypeRevenue: safeNumber(raw?.allTypeRevenue, 0),
    allTypeBookings: safeNumber(raw?.allTypeBookings, 0),
    details: Array.isArray(raw?.details) ? raw.details : [],
  };
}

function getNowYM() {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

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

function formatMoneyVND(v) {
  const n = safeNumber(v, 0);
  return `${Math.round(n).toLocaleString("vi-VN")}₫`;
}

export default function RevenueReport() {
  const nowYM = useMemo(() => getNowYM(), []);
  const [{ month, year }, dispatch] = useReducer(ymReducer, nowYM);

  const [draftYear, setDraftYear] = useState(String(nowYM.year));

  const [stats, setStats] = useState(null);
  const [prevStats, setPrevStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const exportRef = useRef(null);
  const [pdfMode, setPdfMode] = useState(false);

  const token = getToken();

  const safeMonth = useMemo(
    () => clampInt(month, 1, 12, nowYM.month),
    [month, nowYM.month]
  );
  const safeYear = useMemo(
    () => clampInt(year, 1970, 2100, nowYM.year),
    [year, nowYM.year]
  );

  const canGoNext = useMemo(() => {
    if (safeYear < nowYM.year) return true;
    if (safeYear === nowYM.year) return safeMonth < nowYM.month;
    return false;
  }, [safeMonth, safeYear, nowYM.month, nowYM.year]);

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

    const finalYear = Math.min(y, nowYM.year);
    const finalMonth =
      finalYear === nowYM.year ? Math.min(safeMonth, nowYM.month) : safeMonth;

    dispatch({ type: "SET_YM", year: finalYear, month: finalMonth });
    setDraftYear(String(finalYear));
  }, [draftYear, safeYear, safeMonth, nowYM.year, nowYM.month]);

  useEffect(() => {
    setDraftYear(String(safeYear));
  }, [safeYear]);

  const monthLabel = useMemo(() => {
    return new Date(safeYear, safeMonth - 1).toLocaleString("vi-VN", {
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

  const goPrevMonth = useCallback(() => {
    dispatch({ type: "PREV" });
  }, []);

  const goNextMonth = useCallback(() => {
    if (!canGoNext) return;
    dispatch({ type: "NEXT" });
  }, [canGoNext]);

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
        if (alive) setError(e?.message || "Tải dữ liệu thất bại");
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
  }, [safeMonth, safeYear, prevParams.pm, prevParams.py, fetchStatsByMonth]);

  const revenueText = useMemo(
    () => formatMoneyVND(stats?.allTypeRevenue),
    [stats]
  );

  const bookings = useMemo(
    () => safeNumber(stats?.allTypeBookings, 0),
    [stats]
  );

  const avgRevenueText = useMemo(() => {
    const r = safeNumber(stats?.allTypeRevenue, 0);
    const b = safeNumber(stats?.allTypeBookings, 0);
    const avg = b > 0 ? Math.round(r / b) : 0;
    return formatMoneyVND(avg);
  }, [stats]);

  const changePercent = useMemo(() => {
    const cur = safeNumber(stats?.allTypeRevenue, 0);
    const prev = safeNumber(prevStats?.allTypeRevenue, 0);
    if (!prevStats || prev <= 0) return null;
    const pct = ((cur - prev) / prev) * 100;
    return Number.isFinite(pct) ? Number(pct.toFixed(1)) : null;
  }, [stats, prevStats]);

  const exportCSV = async () => {
    if (!isLoggedIn()) return popup.error("Bạn chưa đăng nhập!");
    if (loading) return popup.error("Đang tải dữ liệu, thử lại sau!");
    if (!stats) return popup.error("Không có dữ liệu để xuất.");

    const ok = await popup.confirm(
      `Xuất báo cáo doanh thu tháng ${monthLabel} ra CSV?`,
      "Xác nhận"
    );
    if (!ok) return;

    const curRevenue = safeNumber(stats?.allTypeRevenue, 0);
    const curBookings = safeNumber(stats?.allTypeBookings, 0);
    const avg = curBookings > 0 ? Math.round(curRevenue / curBookings) : 0;

    // ✅ CSV tiếng Việt có dấu
    let csv = "Chỉ số,Giá trị\n";
    csv += `Tháng,${monthLabel}\n`;
    csv += `Số lượt đặt,${curBookings}\n`;
    csv += `Tổng doanh thu (₫),${Math.round(curRevenue)}\n`;
    csv += `Doanh thu trung bình / lượt (₫),${avg}\n`;
    csv += `So với tháng trước (%),${changePercent ?? "Không có"}\n`;

    csv += `\nLoại phòng,Số lượt,Doanh thu (₫)\n`;
    (stats?.details || []).forEach((d) => {
      csv += `${d.roomType ?? ""},${safeNumber(d.count, 0)},${Math.round(
        safeNumber(d.revenue, 0)
      )}\n`;
    });

    // ✅ thêm UTF-8 BOM để Excel đọc tiếng Việt không lỗi
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // ✅ tên file không dấu để hạn chế lỗi hệ điều hành
    a.download = `BaoCaoDoanhThu_${safeYear}-${String(safeMonth).padStart(2, "0")}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    popup.success("Xuất CSV thành công!");
  };

  const exportPDF = async () => {
    try {
      if (!isLoggedIn()) return popup.error("Bạn chưa đăng nhập!");
      if (loading) return popup.error("Đang tải dữ liệu, thử lại sau!");
      if (!stats) return popup.error("Không có dữ liệu để xuất.");
      if (!exportRef.current) return popup.error("Không tìm thấy vùng export!");

      const ok = await popup.confirm(
        `Xuất báo cáo doanh thu tháng ${monthLabel} ra PDF?`,
        "Xác nhận"
      );
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

      // ✅ tên file không dấu
      pdf.save(`BaoCaoDoanhThu_${safeYear}-${String(safeMonth).padStart(2, "0")}.pdf`);
      popup.success("Xuất PDF thành công!");
    } catch (e) {
      console.error(e);
      popup.error(e?.message || "Xuất PDF thất bại!");
    } finally {
      setPdfMode(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div ref={exportRef} className="bg-white">
        {pdfMode && (
          <div className="px-4 sm:px-6 pt-8 pb-4 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              BÁO CÁO DOANH THU
            </h1>
            <div className="text-sm text-gray-600 mt-1">{monthLabel}</div>
            <div className="text-xs text-gray-500 mt-1">
              Tổng doanh thu: {revenueText} · Lượt đặt: {bookings} · TB/lượt đặt:{" "}
              {avgRevenueText}
            </div>
            <div className="mt-4 h-px bg-gray-200" />
          </div>
        )}

        {!pdfMode && (
          <div className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
              <h1 className="text-2xl font-semibold text-gray-900 text-center">
                Báo cáo doanh thu
              </h1>
              <p className="text-sm text-gray-500 text-center mt-1">
                Phân bổ loại phòng và so sánh theo tháng
              </p>

              <div className="mt-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    onClick={goPrevMonth}
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  >
                    Trước
                  </button>

                  <span className="font-medium text-sm sm:text-base whitespace-nowrap">
                    {monthLabel}
                  </span>

                  <button
                    onClick={goNextMonth}
                    disabled={!canGoNext}
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    title={!canGoNext ? "Không xem được tháng tương lai" : ""}
                  >
                    Sau
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center lg:justify-end gap-3">
                  <select
                    className="border rounded-lg px-3 py-2 text-sm bg-white w-full sm:w-auto"
                    value={safeMonth}
                    onChange={(e) => {
                      const m = Number(e.target.value);
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
                          Tháng {m}
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
                    placeholder="Năm"
                  />

                  <button
                    onClick={exportCSV}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-60 w-full sm:w-auto"
                    disabled={!stats || loading}
                  >
                    Xuất CSV
                  </button>

                  <button
                    onClick={exportPDF}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-60 w-full sm:w-auto"
                    disabled={!stats || loading}
                  >
                    Xuất PDF
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
            pdfMode
              ? "grid grid-cols-1 gap-6"
              : "grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8",
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
              <div className="text-sm text-gray-600 mt-2 break-words">
                {error}
              </div>
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
            Tạo bởi EasyTravel · {new Date().toLocaleString("vi-VN")}
          </div>
        )}
      </div>
    </div>
  );
}
