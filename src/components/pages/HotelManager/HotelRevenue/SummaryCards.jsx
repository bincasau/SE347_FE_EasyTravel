export default function SummaryCards({ data }) {
  const totalRevenue = data.reduce((sum, r) => sum + r.revenue, 0);
  const totalBookings = data.reduce((sum, r) => sum + r.bookings, 0);
  const avgRevenue =
    data.length > 0 ? Math.round(totalRevenue / data.length) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
      <Card title="Total Bookings" value={totalBookings} />
      <Card title="Avg / Room" value={`$${avgRevenue}`} />
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">
        {value}
      </p>
    </div>
  );
}
