export default function ComparisonText({
  revenueText,
  bookings,
  avgRevenueText,
  changePercent,
}) {
  const isPositive = typeof changePercent === "number" && changePercent > 0;

  return (
    <div className="bg-white border rounded-lg p-6 flex flex-col justify-center">
      <h2 className="text-lg font-semibold mb-4">So sánh theo tháng</h2>

      <p className="text-3xl font-bold mb-2">{revenueText}</p>

      
      <p className="text-sm text-gray-600 mb-4">
        {bookings} lượt đặt • TB/lượt đặt:{" "}
        <span className="font-semibold text-gray-900">{avgRevenueText}</span>
      </p>

      {typeof changePercent === "number" ? (
        <p
          className={`text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "â–²" : "â–¼"} {Math.abs(changePercent)}% so với tháng trước
        </p>
      ) : (
        <p className="text-sm text-gray-400">Không có dữ liệu tháng trước</p>
      )}
    </div>
  );
}

