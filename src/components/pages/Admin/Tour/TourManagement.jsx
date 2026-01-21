import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminTourCard from "./AdminTourCard";
import Pagination from "@/utils/Pagination";
import { getAllTours, searchToursByKeyword, deleteTour } from "@/apis/Tour";

import { exportToursExcel } from "@/components/pages/Admin/Tour/TourExportExcel";
import { exportTourMonthlyReportPdf } from "@/components/pages/Admin/Tour/TourMonthlyPdf";
import TourImportExcelButton from "@/components/pages/Admin/Tour/ToursImportExcel";
import { popup } from "@/utils/popup";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
  );
}

function normStatus(s) {
  return (s ?? "").toString().trim().toUpperCase();
}

function statusViLabel(s) {
  const v = normStatus(s);
  if (v === "ALL") return "Tất cả trạng thái";
  if (v === "PASSED") return "Đã qua";
  if (v === "ACTIVATED") return "Đang hoạt động";
  if (v === "CANCELLED" || v === "CANCELED") return "Đã hủy";
  return v || "—";
}

function statusBadgeClass(s) {
  const v = normStatus(s);
  if (v === "ACTIVATED")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (v === "PASSED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (v === "CANCELLED" || v === "CANCELED")
    return "bg-red-50 text-red-700 ring-red-200";
  return "bg-gray-100 text-gray-700 ring-gray-200";
}

function formatDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString();
}

function formatVND(v) {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return String(v ?? "-");
  return n.toLocaleString("vi-VN") + " ₫";
}

export default function TourManagement() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const [exportingExcel, setExportingExcel] = useState(false);

  const [openPdf, setOpenPdf] = useState(false);
  const [pdfYear, setPdfYear] = useState(new Date().getFullYear());
  const [exportingPdf, setExportingPdf] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const statusFromUrl = (searchParams.get("status") || "ALL").toUpperCase();
  const qFromUrl = (searchParams.get("q") || "").toString();

  // view mode (card | table)
  const viewFromUrl =
    (searchParams.get("view") || "card").toString().toLowerCase() === "table"
      ? "table"
      : "card";

  // UI state
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);
  const [viewMode, setViewMode] = useState(viewFromUrl);

  // Search state
  const [q, setQ] = useState(qFromUrl);
  const [searching, setSearching] = useState(false);

  const pageSize = 5;

  // ✅ FIX: không dùng close?.() khi không có popup.loading ở đây
  const loadTours = async () => {
    setLoading(true);
    try {
      const list = await getAllTours();
      setTours(list ?? []);
    } catch (e) {
      setTours([]);
      popup.error(e?.message || "Tải danh sách tour thất bại");
    } finally {
      setLoading(false);
    }
  };

  const runSearch = async (keyword) => {
    const k = String(keyword ?? "").trim();

    if (!k) {
      setSearching(false);
      await loadTours();
      return;
    }

    setLoading(true);
    const close = popup.loading("Đang tìm kiếm...");
    setSearching(true);

    try {
      const list = await searchToursByKeyword(k);
      setTours(list ?? []);
    } catch (e) {
      setTours([]);
      popup.error(e?.message || "Tìm kiếm thất bại");
    } finally {
      close?.();
      setLoading(false);
    }
  };

  // INIT: nếu URL có q thì search, không thì load all
  useEffect(() => {
    if (qFromUrl.trim()) runSearch(qFromUrl);
    else loadTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync URL -> state
  useEffect(() => setCurrentPage(pageFromUrl), [pageFromUrl]);
  useEffect(() => setStatusFilter(statusFromUrl), [statusFromUrl]);
  useEffect(() => setQ(qFromUrl), [qFromUrl]);
  useEffect(() => setViewMode(viewFromUrl), [viewFromUrl]);

  const statusOptions = useMemo(() => {
    const set = new Set();
    for (const t of tours) {
      const s = normStatus(t?.status);
      if (s) set.add(s);
    }
    const dynamic = Array.from(set).sort();
    return ["ALL", ...dynamic];
  }, [tours]);

  // Filter theo status
  const filteredTours = useMemo(() => {
    if (statusFilter === "ALL") return tours;
    return tours.filter((t) => normStatus(t?.status) === statusFilter);
  }, [tours, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / pageSize));
  const safePage = clamp(currentPage, 1, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleTours = filteredTours.slice(startIndex, startIndex + pageSize);

  // nếu currentPage vượt totalPages -> tự kéo về
  useEffect(() => {
    if (currentPage > totalPages) {
      const next = clamp(currentPage, 1, totalPages);
      setCurrentPage(next);
      setSearchParams((prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("page", String(next));
        sp.set("status", statusFilter);
        sp.set("view", viewMode);
        if (qFromUrl.trim()) sp.set("q", qFromUrl.trim());
        else sp.delete("q");
        return sp;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => now - 3 + i);
  }, []);

  const applyStatusFilter = (nextStatus) => {
    const s = (nextStatus || "ALL").toUpperCase();
    setStatusFilter(s);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("page", "1");
      sp.set("status", s);
      sp.set("view", viewMode);
      if (qFromUrl.trim()) sp.set("q", qFromUrl.trim());
      else sp.delete("q");
      return sp;
    });
  };

  const applyViewMode = (next) => {
    const v = next === "table" ? "table" : "card";
    setViewMode(v);
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("view", v);
      sp.set("page", String(currentPage || 1));
      sp.set("status", statusFilter || "ALL");
      if (qFromUrl.trim()) sp.set("q", qFromUrl.trim());
      else sp.delete("q");
      return sp;
    });
  };

  const handleExportExcel = () => {
    setExportingExcel(true);
    try {
      exportToursExcel(filteredTours, "tours.xlsx");
      popup.success("Xuất Excel thành công");
    } catch (e) {
      popup.error(e?.message || "Xuất Excel thất bại");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    const close = popup.loading("Đang xuất PDF...");
    try {
      await exportTourMonthlyReportPdf(Number(pdfYear));
      setOpenPdf(false);
      popup.success("Xuất PDF thành công");
    } catch (e) {
      popup.error(e?.message || "Xuất PDF thất bại");
    } finally {
      close?.();
      setExportingPdf(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const kw = (q || "").trim();

    setCurrentPage(1);
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("page", "1");
      sp.set("status", statusFilter);
      sp.set("view", viewMode);
      if (kw) sp.set("q", kw);
      else sp.delete("q");
      return sp;
    });

    await runSearch(kw);
  };

  const handleClearSearch = async () => {
    setQ("");
    setSearching(false);

    setCurrentPage(1);
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("page", "1");
      sp.set("status", statusFilter);
      sp.set("view", viewMode);
      sp.delete("q");
      return sp;
    });

    await loadTours();
  };

  const handleRemoveTour = async (tourId) => {
    const id = Number(tourId);
    if (!id) return;

    const ok = await popup.confirm("Bạn có chắc chắn muốn xóa tour này không?");
    if (!ok) return;

    const close = popup.loading("Đang xóa tour...");
    try {
      await deleteTour(id);
      popup.success("Đã xóa tour");
      await loadTours();
    } catch (e) {
      popup.error(e?.message || "Xóa tour thất bại");
    } finally {
      close?.();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex flex-col gap-3 sm:gap-4 mb-6">
        {/* Row 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Quản lý Tour</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => applyViewMode("card")}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition disabled:opacity-60 ${
                  viewMode === "card"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                Thẻ
              </button>
              <button
                type="button"
                onClick={() => applyViewMode("table")}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition disabled:opacity-60 ${
                  viewMode === "table"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                Bảng
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => applyStatusFilter(e.target.value)}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 outline-none disabled:opacity-60"
              title="Lọc theo trạng thái"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {statusViLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit(e);
            }}
            disabled={loading}
            placeholder="Tìm theo tên / điểm đến..."
            className="flex-1 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 outline-none disabled:opacity-60"
          />

          {q?.trim() && (
            <button
              type="button"
              onClick={handleClearSearch}
              disabled={loading}
              className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-60"
            >
              Xóa
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Row 3 */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2 sm:gap-3">
          <button
            onClick={handleExportExcel}
            disabled={loading || exportingExcel}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {exportingExcel ? (
              <>
                <Spinner /> Đang xuất...
              </>
            ) : (
              "Xuất Excel"
            )}
          </button>

          <div className="w-full sm:w-auto">
            {/* ✅ FIX: truyền cả 2 prop cho chắc chắn (component import có thể dùng onDone hoặc onImported) */}
            <TourImportExcelButton
              defaultGuideId={1}
              onDone={loadTours}
              onImported={loadTours}
            />
          </div>

          <button
            onClick={() => setOpenPdf(true)}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
          >
            Xuất báo cáo PDF
          </button>

          <Link to={`/admin/tours/new`} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition">
              Thêm tour
            </button>
          </Link>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="py-10 flex items-center justify-center gap-3 text-gray-600">
          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          Đang tải danh sách tour...
        </div>
      ) : visibleTours.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          Không có tour nào
          {qFromUrl.trim() ? ` với từ khóa "${qFromUrl.trim()}".` : ""}
          {statusFilter === "ALL"
            ? ""
            : ` thuộc trạng thái "${statusViLabel(statusFilter)}".`}
        </p>
      ) : viewMode === "card" ? (
        <div className="space-y-4 sm:space-y-6">
          {visibleTours.map((tour) => (
            <AdminTourCard
              key={tour.tourId}
              tour={tour}
              onEdit={() => console.log("Edit:", tour.tourId)}
              onRemove={() => loadTours()}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Tên tour</th>
                <th className="px-4 py-3 font-semibold">Điểm đến</th>
                <th className="px-4 py-3 font-semibold">Thời gian</th>
                <th className="px-4 py-3 font-semibold">Giá </th>
                <th className="px-4 py-3 font-semibold">Ghế</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {visibleTours.map((t) => {
                const st = normStatus(t?.status);
                return (
                  <tr key={t?.tourId} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {t?.tourId ?? "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {t?.title ?? "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Xuất phát: {t?.departureLocation ?? "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {t?.destination ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatDate(t?.startDate)} → {formatDate(t?.endDate)}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatVND(t?.priceAdult)}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {Number(t?.availableSeats ?? 0)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${statusBadgeClass(
                          st,
                        )}`}
                      >
                        {statusViLabel(st)}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="inline-flex gap-2 justify-end">
                        <Link
                          to={`/admin/tours/edit/${t?.tourId}`}
                          className="px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                          title="Sửa"
                        >
                          Sửa
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemoveTour(t?.tourId)}
                          className="px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                          title="Xóa"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        totalPages={totalPages}
        currentPage={safePage}
        visiblePages={null}
        onPageChange={(p) => {
          const next = clamp(p, 1, totalPages);
          setCurrentPage(next);
          setSearchParams((prev) => {
            const sp = new URLSearchParams(prev);
            sp.set("page", String(next));
            sp.set("status", statusFilter);
            sp.set("view", viewMode);
            if (qFromUrl.trim()) sp.set("q", qFromUrl.trim());
            else sp.delete("q");
            return sp;
          });
        }}
      />

      {/* MODAL PDF */}
      {openPdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => !exportingPdf && setOpenPdf(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Xuất báo cáo PDF</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chọn năm
              </label>
              <select
                value={pdfYear}
                onChange={(e) => setPdfYear(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 outline-none"
                disabled={exportingPdf}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-500 mt-2">
                PDF gồm: bảng thống kê 12 tháng + biểu đồ doanh thu theo tháng.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setOpenPdf(false)}
                disabled={exportingPdf}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-60"
              >
                Hủy
              </button>

              <button
                onClick={handleExportPdf}
                disabled={exportingPdf}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {exportingPdf ? (
                  <>
                    <Spinner /> Đang xuất...
                  </>
                ) : (
                  "Xuất"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
