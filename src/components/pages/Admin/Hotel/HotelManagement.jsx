import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getHotels, getHotelManagerByHotelId } from "@/apis/Hotel";
import AdminHotelCard from "@/components/pages/Admin/Hotel/AdminHotelCard";
import Pagination from "@/utils/Pagination";
import ExportHotelsExcelButton from "@/components/pages/Admin/Hotel/HotelsExportExcel";
import HotelsImportExcelButton from "@/components/pages/Admin/Hotel/HotelsImportExcel"; // NEW

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
        console.log("Fetched manager for hotelId", hid, manager);
        const managerId = manager?.userId ??  "";
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
    <div className="max-w-5xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Hotel management</h1>

        <div className="flex items-center gap-3">
          {/* NEW: Import */}
          <HotelsImportExcelButton onImported={() => loadHotels(page)} />

          {/* Export (đã có ManagerId) */}
          <ExportHotelsExcelButton />

          <Link to="/admin/hotels/add">
            <button className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
              + Add Hotel
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No hotels found.</p>
      ) : (
        <div className="flex flex-col gap-6">
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

      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={page + 1}
          visiblePages={null}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
