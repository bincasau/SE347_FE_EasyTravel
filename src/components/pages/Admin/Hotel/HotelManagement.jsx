import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getHotels } from "@/apis/Hotel";
import AdminHotelCard from "@/components/pages/Admin/Hotel/AdminHotelCard";
import Pagination from "@/utils/Pagination";

export default function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [page, setPage] = useState(pageFromUrl - 1);
  const [totalPages, setTotalPages] = useState(1);

  async function loadHotels(currentPage = 0) {
    setLoading(true);
    try {
      const data = await getHotels({
        page: currentPage,
        size: 5,
        sort: "hotelId,asc",
      });

      setHotels(data._embedded?.hotels ?? []);
      setTotalPages(data.page?.totalPages ?? 1);
      setPage(data.page?.number ?? 0);
    } catch (error) {
      console.error("Error loading hotels:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadHotels(pageFromUrl - 1);
  }, [pageFromUrl]);


  const handlePageChange = (p) => {
    setSearchParams({ page: p });
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Hotel management</h1>

        <Link to="/admin/hotels/add">
          <button className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
            + Add Hotel
          </button>
        </Link>
      </div>

      {/* LIST */}
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
              onEdit={() => console.log("Edit:", hotel)}
              onRemove={() => console.log("Remove:", hotel.hotelId)}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
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
