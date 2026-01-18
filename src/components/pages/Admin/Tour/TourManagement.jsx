import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminTourCard from "./AdminTourCard";
import Pagination from "@/utils/Pagination";
import { getAllTours } from "@/apis/Tour";

import { exportToursExcel } from "@/components/pages/Admin/Tour/TourExportExcel";
import { exportTourMonthlyReportPdf } from "@/components/pages/Admin/Tour/TourMonthlyPdf";
import TourImportExcelButton from "@/components/pages/Admin/Tour/ToursImportExcel";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
  );
}

export default function TourManagement() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const [exportingExcel, setExportingExcel] = useState(false);

  const [openPdf, setOpenPdf] = useState(false);
  const [pdfYear, setPdfYear] = useState(new Date().getFullYear());
  const [exportingPdf, setExportingPdf] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const pageSize = 5;

  const loadTours = async () => {
    setLoading(true);
    try {
      const list = await getAllTours();
      setTours(list ?? []);
    } catch (e) {
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => setCurrentPage(pageFromUrl), [pageFromUrl]);

  const totalPages = Math.max(1, Math.ceil(tours.length / pageSize));
  const safePage = clamp(currentPage, 1, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleTours = tours.slice(startIndex, startIndex + pageSize);

  // nếu totalPages giảm sau import/xóa, đảm bảo page không vượt
  useEffect(() => {
    if (currentPage > totalPages) {
      const next = clamp(currentPage, 1, totalPages);
      setCurrentPage(next);
      setSearchParams({ page: String(next) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => now - 3 + i);
  }, []);

  const handleExportExcel = () => {
    setExportingExcel(true);
    try {
      exportToursExcel(tours, "tours.xlsx");
    } catch (e) {
      alert(e?.message || "Export excel failed");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportTourMonthlyReportPdf(Number(pdfYear));
      setOpenPdf(false);
    } catch (e) {
      alert(e?.message || "Export pdf failed");
    } finally {
      setExportingPdf(false);
    }
  };

  const disableActions = loading || exportingExcel || exportingPdf;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">
            Tour Management
          </h1>
          <div className="text-sm text-gray-500">
            Tổng: {tours.length} tours
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportExcel}
            disabled={loading || exportingExcel}
            className="w-full sm:w-auto px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {exportingExcel ? (
              <>
                <Spinner /> Exporting...
              </>
            ) : (
              "Export Excel"
            )}
          </button>

          <div className="w-full sm:w-auto">
            <TourImportExcelButton
              defaultGuideId={1}
              onImported={loadTours}
            />
          </div>

          <button
            onClick={() => setOpenPdf(true)}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-60"
          >
            Export PDF Report
          </button>

          <Link to={`/admin/tours/new`} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
              + Add Tour
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading tours...</p>
      ) : visibleTours.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No tours found.</p>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {visibleTours.map((tour) => (
            <AdminTourCard
              key={tour.tourId}
              tour={tour}
              onEdit={() => console.log("Edit:", tour.tourId)}
              onRemove={() => console.log("Remove:", tour.tourId)}
            />
          ))}
        </div>
      )}

      <Pagination
        totalPages={totalPages}
        currentPage={safePage}
        visiblePages={null}
        onPageChange={(p) => {
          const next = clamp(p, 1, totalPages);
          setCurrentPage(next);
          setSearchParams({ page: String(next) });
        }}
      />

      {/* MODAL PDF responsive */}
      {openPdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => !exportingPdf && setOpenPdf(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Export PDF Report</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select year
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
                Cancel
              </button>

              <button
                onClick={handleExportPdf}
                disabled={exportingPdf}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {exportingPdf ? (
                  <>
                    <Spinner /> Exporting...
                  </>
                ) : (
                  "Export"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
