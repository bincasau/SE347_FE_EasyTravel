export default function ComparisonText({ revenue, changePercent }) {
  const isPositive = changePercent > 0;

  return (
    <div className="bg-white border rounded-lg p-6 flex flex-col justify-center">
      <h2 className="text-lg font-semibold mb-4">
        Monthly Comparison
      </h2>

      <p className="text-3xl font-bold mb-2">
        ${revenue.toLocaleString()}
      </p>

      {changePercent ? (
        <p
          className={`text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(changePercent)}% compared
          to last month
        </p>
      ) : (
        <p className="text-sm text-gray-400">
          No previous data available
        </p>
      )}
    </div>
  );
}
