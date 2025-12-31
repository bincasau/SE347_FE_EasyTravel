import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b"];

export default function RoomTypePie({ data = [] }) {
  if (!data.length) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">
        Room Type Distribution
      </h2>

      <PieChart width={300} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="type"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((item, index) => (
            <Cell
              key={item.type}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      <ul className="mt-4 space-y-2 text-sm">
        {data.map((r) => (
          <li key={r.type} className="flex justify-between">
            <span>{r.type}</span>
            <span className="font-medium">{r.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
