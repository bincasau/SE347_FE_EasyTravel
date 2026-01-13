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

  // NEW: tách ra để gọi lại sau import
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
      await exportTourMonthlyReportPdf(pdfYear);
      setOpenPdf(false);
    } catch (e) {
      alert(e?.message || "Export pdf failed");
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tour Management</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition disabled:opacity-60"
          >
            {exportingExcel ? "Exporting..." : "Export Excel"}
          </button>

          {/* NEW: Import button */}
          <TourImportExcelButton
            defaultGuideId={1} // đổi thành guideId mặc định của bạn (nếu excel không có cột TourGuideId)
            onImported={loadTours} // import xong reload list
          />

          <button
            onClick={() => setOpenPdf(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            Export PDF Report
          </button>

          <Link to={`/admin/tours/new`}>
            <button className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
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
        <div className="space-y-8">
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

      {openPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[440px] rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Export PDF Report</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select year
              </label>
              <select
                value={pdfYear}
                onChange={(e) => setPdfYear(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 outline-none"
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

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenPdf(false)}
                disabled={exportingPdf}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleExportPdf}
                disabled={exportingPdf}
                className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
              >
                {exportingPdf ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
