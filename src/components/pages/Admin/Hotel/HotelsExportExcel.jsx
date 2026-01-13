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

export default function ExportHotelsExcelButton({
  fileName = "hotels.xlsx",
  sheetName = "Hotels",
  pageSize = 100,
  sort = "hotelId,asc",
  className = "px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition disabled:opacity-60",
}) {
  const [exporting, setExporting] = useState(false);

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
    setExporting(true);
    try {
      const all = [];
      let current = 0;
      let total = 1;

      do {
        const data = await getHotels({
          page: current,
          size: pageSize,
          sort,
        });

        all.push(...(data?._embedded?.hotels ?? []));
        total = data?.page?.totalPages ?? 1;
        current += 1;
      } while (current < total);

      if (all.length === 0) {
        alert("No hotels to export");
        return;
      }

      const withManagers = await Promise.all(
        all.map(async (h) => {
          const { managerId, managerUsername } = await getManagerInfoSafe(
            h?.hotelId
          );
          return { ...h, managerId, managerUsername };
        })
      );

      const rows = withManagers.map(mapHotelToExcelRow);

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      XLSX.writeFile(wb, fileName);
    } catch (e) {
      alert("Export failed: " + (e?.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportExcel}
      disabled={exporting}
      className={className}
    >
      {exporting ? "Exporting..." : "Export Excel"}
    </button>
  );
}
