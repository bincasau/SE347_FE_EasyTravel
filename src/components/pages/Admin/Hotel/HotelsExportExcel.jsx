import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { getHotels, getHotelManagerByHotelId } from "@/apis/Hotel";

function mapHotelToExcelRow(h) {
  return {
    HotelId: h?.hotelId ?? "",
    Name: h?.name ?? "",
    Address: h?.address ?? "",
    Email: h?.email ?? "",
    PhoneNumber: h?.phoneNumber ?? "",
    MinPrice: h?.minPrice ?? "",
    MainImage: h?.mainImage ?? "",
    Description: h?.description ?? "",
    CreatedAt: h?.createdAt ?? "",
    UpdatedAt: h?.updatedAt ?? "",
    ManagerId: h?.managerId ?? "",
    ManagerUsername: h?.managerUsername ?? "",
  };
}

/** simple concurrency limiter */
async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let i = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await mapper(items[idx], idx);
    }
  });

  await Promise.all(workers);
  return results;
}

function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
      />
    </svg>
  );
}

export default function ExportHotelsExcelButton({
  fileName = "hotels.xlsx",
  sheetName = "Hotels",
  pageSize = 100,
  sort = "hotelId,asc",
  className = "",
  // limit số request manager chạy đồng thời (tùy backend)
  managerConcurrency = 8,
}) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState({
    phase: "idle", // idle | fetching | enriching | writing
    current: 0,
    total: 0,
  });

  const managerCacheRef = useRef(new Map());

  async function getManagerInfoSafe(hotelId) {
    if (!hotelId) return { managerId: "", managerUsername: "" };

    if (managerCacheRef.current.has(hotelId)) {
      return managerCacheRef.current.get(hotelId);
    }

    try {
      const manager = await getHotelManagerByHotelId(hotelId);
      const info = {
        managerId: manager?.userId ?? "",
        managerUsername: manager?.username ?? "",
      };
      managerCacheRef.current.set(hotelId, info);
      return info;
    } catch {
      const info = { managerId: "", managerUsername: "" };
      managerCacheRef.current.set(hotelId, info);
      return info;
    }
  }

  const handleExportExcel = async () => {
    if (exporting) return;

    setExporting(true);
    setProgress({ phase: "fetching", current: 0, total: 0 });

    try {
      const all = [];
      let currentPage = 0;
      let totalPages = 1;

      // 1) Fetch all hotels (paged)
      do {
        const data = await getHotels({
          page: currentPage,
          size: pageSize,
          sort,
        });

        const chunk = data?._embedded?.hotels ?? [];
        all.push(...chunk);

        totalPages = data?.page?.totalPages ?? 1;
        currentPage += 1;

        setProgress({
          phase: "fetching",
          current: Math.min(currentPage, totalPages),
          total: totalPages,
        });
      } while (currentPage < totalPages);

      if (all.length === 0) {
        alert("No hotels to export");
        return;
      }

      // 2) Enrich managers with concurrency limit + progress
      setProgress({ phase: "enriching", current: 0, total: all.length });

      const withManagers = await mapWithConcurrency(
        all,
        managerConcurrency,
        async (h, idx) => {
          const { managerId, managerUsername } = await getManagerInfoSafe(h?.hotelId);
          // update progress (throttle nhẹ bằng requestAnimationFrame)
          if ((idx + 1) % 5 === 0 || idx + 1 === all.length) {
            setProgress({ phase: "enriching", current: idx + 1, total: all.length });
          }
          return { ...h, managerId, managerUsername };
        }
      );

      // 3) Write file
      setProgress({ phase: "writing", current: 1, total: 1 });

      const rows = withManagers.map(mapHotelToExcelRow);
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
    } catch (e) {
      alert("Export failed: " + (e?.message || "Unknown error"));
    } finally {
      setExporting(false);
      setProgress({ phase: "idle", current: 0, total: 0 });
    }
  };

  const isFetching = progress.phase === "fetching";
  const isEnriching = progress.phase === "enriching";
  const isWriting = progress.phase === "writing";

  const percent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  const label = exporting
    ? isFetching
      ? `Fetching pages... ${percent}% (${progress.current}/${progress.total})`
      : isEnriching
      ? `Exporting... ${percent}% (${progress.current}/${progress.total})`
      : isWriting
      ? "Writing file..."
      : "Exporting..."
    : "Export Excel";

  const baseClass =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-60 disabled:cursor-not-allowed " +
    "px-4 py-2 sm:px-5 sm:py-2.5 " +
    "w-full sm:w-auto " +
    "bg-green-600 text-white hover:bg-green-700 " +
    "text-sm sm:text-base";

  return (
    <button
      onClick={handleExportExcel}
      disabled={exporting}
      className={`${baseClass} ${className}`}
    >
      {exporting ? <Spinner className="w-4 h-4" /> : null}
      <span className="truncate max-w-[22ch] sm:max-w-none">{label}</span>

      {/* progress bar nhỏ gọn (chỉ hiện khi enriching) */}
      {exporting && isEnriching ? (
        <span className="hidden sm:inline-flex items-center ml-2">
          <span className="w-24 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <span
              className="block h-full bg-white/80"
              style={{ width: `${percent}%` }}
            />
          </span>
        </span>
      ) : null}
    </button>
  );
}
