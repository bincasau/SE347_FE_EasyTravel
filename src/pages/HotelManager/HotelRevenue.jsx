import { useMemo, useState } from "react";
import SummaryCards from "@/components/pages/HotelManager/HotelRevenue/SummaryCards";
import RevenueTable from "@/components/pages/HotelManager/HotelRevenue/RevenueTable";

export default function HotelRevenue() {
  const [month, setMonth] = useState("2024-09");
  const [sortBy, setSortBy] = useState("revenue_desc");

  const data = [
    {
      room_id: 1,
      room_number: "A101",
      room_type: "Deluxe",
      bookings: 12,
      nights: 34,
      revenue: 2100,
    },
    {
      room_id: 2,
      room_number: "A102",
      room_type: "Standard",
      bookings: 8,
      nights: 21,
      revenue: 980,
    },
    {
      room_id: 3,
      room_number: "B201",
      room_type: "Suite",
      bookings: 5,
      nights: 18,
      revenue: 2700,
    },
  ];

  const sortedData = useMemo(() => {
    const arr = [...data];
    switch (sortBy) {
      case "revenue_desc":
        return arr.sort((a, b) => b.revenue - a.revenue);
      case "revenue_asc":
        return arr.sort((a, b) => a.revenue - b.revenue);
      case "bookings_desc":
        return arr.sort((a, b) => b.bookings - a.bookings);
      default:
        return arr;
    }
  }, [sortBy]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Hotel Revenue
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Revenue performance by room
          </p>

          {/* Filters */}
          <div className="mt-6 flex justify-center gap-4">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="revenue_desc">
                Revenue: High → Low
              </option>
              <option value="revenue_asc">
                Revenue: Low → High
              </option>
              <option value="bookings_desc">
                Bookings: High → Low
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <SummaryCards data={sortedData} />
        <RevenueTable data={sortedData} />
      </div>
    </div>
  );
}
