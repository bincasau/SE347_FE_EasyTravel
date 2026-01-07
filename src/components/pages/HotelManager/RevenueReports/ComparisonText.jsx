export default function ComparisonText({
  revenueText,
  bookings,
  avgRevenueText,
  changePercent,
}) {
  const isPositive = typeof changePercent === "number" && changePercent > 0;

  return (
    <div className="bg-white border rounded-lg p-6 flex flex-col justify-center">
      <h2 className="text-lg font-semibold mb-4">Monthly Comparison</h2>

      {/* ✅ Tổng doanh thu */}
      <p className="text-3xl font-bold mb-2">{revenueText}</p>

      {/* ✅ Avg/booking (hợp lý để nhìn nhanh) */}
      <p className="text-sm text-gray-600 mb-4">
        {bookings} booking(s) • Avg/booking:{" "}
        <span className="font-semibold text-gray-900">{avgRevenueText}</span>
      </p>

      {typeof changePercent === "number" ? (
        <p
          className={`text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(changePercent)}% compared to last month
        </p>
      ) : (
        <p className="text-sm text-gray-400">No previous data available</p>
      )}
    </div>
  );
}
