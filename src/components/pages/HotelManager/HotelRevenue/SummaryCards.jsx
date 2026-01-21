export default function SummaryCards({ data = [] }) {
  const totalBookings = data.length;

  const totalRevenue = data.reduce((sum, b) => {
    const v = b?.payment?.totalPrice ?? b?.totalPrice ?? 0;
    const n = Number(v);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const avgRevenue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="Tổng doanh thu" value={totalRevenue.toLocaleString()} />
      <Card title="Tổng lượt đặt" value={totalBookings} />
      <Card title="TB / lượt đặt" value={avgRevenue.toLocaleString()} />
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
