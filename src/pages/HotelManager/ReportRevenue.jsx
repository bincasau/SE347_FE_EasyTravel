import { useMemo, useState } from "react";
import RoomTypePie from "@/components/pages/HotelManager/RevenueReports/RoomTypePie.jsx";
import ComparisonText from "@/components/pages/HotelManager/RevenueReports/ComparisonText.jsx";

export default function RevenueReport() {
  const [month, setMonth] = useState(8); // September (0-based)
  const year = 2024;

  // ===== MOCK DATA =====
  const reportData = {
    7: {
      revenue: 8200,
      rooms: [
        { type: "Deluxe", value: 40 },
        { type: "Standard", value: 38 },
        { type: "Suite", value: 22 },
      ],
    },
    8: {
      revenue: 9200,
      rooms: [
        { type: "Deluxe", value: 45 },
        { type: "Standard", value: 35 },
        { type: "Suite", value: 20 },
      ],
    },
  };

  const current = reportData[month];
  const previous = reportData[month - 1];

  const monthLabel = new Date(year, month).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const changePercent = useMemo(() => {
    if (!previous) return null;
    return (
      ((current.revenue - previous.revenue) / previous.revenue) *
      100
    ).toFixed(1);
  }, [current, previous]);

  // ===== EXPORT CSV =====
  const exportCSV = () => {
    let csv = "Room Type,Percentage\n";
    current.rooms.forEach((r) => {
      csv += `${r.type},${r.value}%\n`;
    });

    csv += `\nTotal Revenue,${current.revenue}\n`;
    csv += `Compared to last month,${changePercent || "N/A"}%\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Revenue_Report_${monthLabel}.csv`;
    a.click();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Revenue Report
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Room type distribution & monthly comparison
          </p>

          {/* Controls */}
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                disabled={!previous}
                onClick={() => setMonth((m) => m - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                ← Prev
              </button>

              <span className="font-medium">{monthLabel}</span>

              <button
                disabled={!reportData[month + 1]}
                onClick={() => setMonth((m) => m + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next →
              </button>
            </div>

            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <RoomTypePie data={current.rooms} />
        <ComparisonText
          revenue={current.revenue}
          changePercent={changePercent}
        />
      </div>
    </div>
  );
}
