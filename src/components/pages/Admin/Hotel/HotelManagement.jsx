import { useEffect, useState } from "react";
import { getHotels } from "@/apis/Hotel"; 
import AdminHotelCard from "@/components/pages/Admin/Hotel/AdminHotelCard";

export default function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Gọi API lấy danh sách có phân trang
  async function loadHotels(currentPage = 0) {
    setLoading(true);

    try {
      const data = await getHotels({
        page: currentPage,
        size: 5, // mỗi trang 5 khách sạn
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
    loadHotels(page);
  }, []);

  const goPrev = () => {
    if (page > 0) loadHotels(page - 1);
  };

  const goNext = () => {
    if (page < totalPages - 1) loadHotels(page + 1);
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Hotel management</h1>

        <button className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition">
          + Add Hotel
        </button>
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
      <div className="flex justify-center items-center gap-3 mt-8">
        <button
          onClick={goPrev}
          disabled={page === 0}
          className={`px-4 py-2 border rounded-full ${
            page === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          Prev
        </button>

        <span className="font-medium">
          Page {page + 1} / {totalPages}
        </span>

        <button
          onClick={goNext}
          disabled={page >= totalPages - 1}
          className={`px-4 py-2 border rounded-full ${
            page >= totalPages - 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
