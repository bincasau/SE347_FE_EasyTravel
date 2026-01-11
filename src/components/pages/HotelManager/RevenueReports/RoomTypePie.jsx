import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS_BY_TYPE = {
  Standard: "#2563eb",
  VIP: "#10b981",
  President: "#f59e0b",
};

const ORDER = ["Standard", "VIP", "President"];

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatMoneyVND(v) {
  const num = safeNumber(v, 0);
  return `${num.toLocaleString("vi-VN")}₫`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  return (
    <div className="bg-white border rounded-lg p-3 shadow text-sm">
      <div className="font-semibold text-gray-900">{p.type}</div>
      <div className="text-gray-700">Bookings: {p.count}</div>
      <div className="text-gray-700">Revenue: {formatMoneyVND(p.revenue)}</div>
      <div className="text-gray-700">Share: {p.percent}%</div>
    </div>
  );
}

export default function RoomTypePie({ stats }) {
  const data = useMemo(() => {
    const details = Array.isArray(stats?.details) ? stats.details : [];

    const map = new Map();
    for (const d of details) {
      const type = d?.roomType;
      if (!type) continue;
      map.set(type, {
        count: safeNumber(d?.count, 0),
        revenue: safeNumber(d?.revenue, 0),
      });
    }

    const rows = ORDER.map((type) => {
      const v = map.get(type) || { count: 0, revenue: 0 };
      return { type, count: v.count, revenue: v.revenue };
    });

    const total = rows.reduce((s, r) => s + r.count, 0);

    return rows.map((r) => ({
      type: r.type,
      value: r.count, // pie theo COUNT
      count: r.count,
      revenue: r.revenue,
      percent: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  }, [stats]);

  const totalBookings = data.reduce((s, r) => s + r.count, 0);
  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);

  if (!stats) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  if (totalBookings === 0) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Room Type Distribution</h2>
        <p className="text-gray-400">No bookings in this month</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Room Type Distribution</h2>
          <div className="text-sm text-gray-500 mt-1">
            Total bookings: <b className="text-gray-900">{totalBookings}</b> • Total revenue:{" "}
            <b className="text-gray-900">{formatMoneyVND(totalRevenue)}</b>
          </div>
        </div>
      </div>

      <div className="mt-5" style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ payload }) => `${payload.type} ${payload.percent}%`}
            >
              {data.map((item) => (
                <Cell key={item.type} fill={COLORS_BY_TYPE[item.type] || "#999999"} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {data.map((r) => (
          <li key={r.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded" style={{ background: COLORS_BY_TYPE[r.type] }} />
              <span className="text-gray-800">{r.type}</span>
            </div>
            <div className="text-gray-700">
              <b className="text-gray-900">{r.count}</b> ({r.percent}%) • {formatMoneyVND(r.revenue)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
