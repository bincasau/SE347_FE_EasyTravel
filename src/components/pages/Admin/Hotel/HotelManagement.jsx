import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getHotels, getHotelManagerByHotelId } from "@/apis/Hotel";
import AdminHotelCard from "@/components/pages/Admin/Hotel/AdminHotelCard";
import Pagination from "@/utils/Pagination";
import ExportHotelsExcelButton from "@/components/pages/Admin/Hotel/HotelsExportExcel";
import HotelsImportExcelButton from "@/components/pages/Admin/Hotel/HotelsImportExcel";

export default function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [page, setPage] = useState(pageFromUrl - 1);
  const [totalPages, setTotalPages] = useState(1);

  const managerCacheRef = useRef(new Map());

  async function attachManagers(list) {
    if (!Array.isArray(list) || list.length === 0) return [];

    const tasks = list.map(async (h) => {
      const hid = h?.hotelId;
      if (!hid) return h;

      if (managerCacheRef.current.has(hid)) {
        const cached = managerCacheRef.current.get(hid);
        return { ...h, ...cached };
      }

      try {
        const manager = await getHotelManagerByHotelId(hid);
        const managerId = manager?.userId ?? "";
        const extra = { managerId, manager };
        managerCacheRef.current.set(hid, extra);
        return { ...h, ...extra };
      } catch {
        const extra = { managerId: "", manager: null };
        managerCacheRef.current.set(hid, extra);
        return { ...h, ...extra };
      }
    });

    return Promise.all(tasks);
  }

  async function loadHotels(currentPage = 0) {
    setLoading(true);
    try {
      const data = await getHotels({
        page: currentPage,
        size: 5,
        sort: "hotelId,asc",
      });

      const list = data?._embedded?.hotels ?? [];
      const withManagers = await attachManagers(list);

      setHotels(withManagers);
      setTotalPages(data?.page?.totalPages ?? 1);
      setPage(data?.page?.number ?? 0);
    } catch (error) {
      console.error("Error loading hotels:", error);
      setHotels([]);
      setTotalPages(1);
      setPage(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels(pageFromUrl - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrl]);

  const handlePageChange = (p) => {
    setSearchParams({ page: p });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Hotel management</h1>

        {/* ACTIONS: wrap on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Import */}
          <div className="w-full sm:w-auto">
            <HotelsImportExcelButton onImported={() => loadHotels(page)} />
          </div>

          {/* Export */}
          <div className="w-full sm:w-auto">
            <ExportHotelsExcelButton />
          </div>

          <Link to="/admin/hotels/add" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
              + Add Hotel
            </button>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center py-10 text-gray-600">Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No hotels found.</p>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6">
          {hotels.map((hotel) => (
            <AdminHotelCard
              key={hotel.hotelId}
              hotel={hotel}
              managerId={hotel.managerId}
              manager={hotel.manager}
              onEdit={() => console.log("Edit:", hotel)}
              onRemove={() => console.log("Remove:", hotel.hotelId)}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center px-2">
          <div className="w-full sm:w-auto overflow-x-auto">
            <Pagination
              totalPages={totalPages}
              currentPage={page + 1}
              visiblePages={null}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
