function fmtMoney(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toLocaleString() : "0";
}

export default function RevenueTable({ data = [] }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">Check-in</th>
            <th className="px-4 py-3 text-left">Check-out</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Revenue</th>
          </tr>
        </thead>

        <tbody>
          {data.map((b) => {
            const revenue = b?.payment?.totalPrice ?? b?.totalPrice ?? 0;

            return (
              <tr
                key={b.bookingId ?? `${b.checkInDate}-${b.checkOutDate}`}
                className="border-b last:border-none"
              >
                <td className="px-4 py-3">{b.checkInDate || "-"}</td>
                <td className="px-4 py-3">{b.checkOutDate || "-"}</td>
                <td className="px-4 py-3 font-medium">{b.status || "-"}</td>

                <td className="px-4 py-3 text-right font-semibold">
                  {fmtMoney(revenue)}
                </td>
              </tr>
            );
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                No bookings
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
