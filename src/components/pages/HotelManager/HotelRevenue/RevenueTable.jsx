import { useNavigate } from "react-router-dom";

export default function RevenueTable({ data }) {
  const navigate = useNavigate();

  const goDetail = (r) => {
    navigate("/hotel-manager/revenue/bookings", {
      state: { room: r }, // ✅ gửi room qua trang detail
    });
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">Room</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-right">Bookings</th>
            <th className="px-4 py-3 text-right">Nights</th>
            <th className="px-4 py-3 text-right">Revenue</th>
            <th className="px-4 py-3 text-right">Action</th> {/* ✅ NEW */}
          </tr>
        </thead>

        <tbody>
          {data.map((r) => (
            <tr key={r.room_id} className="border-b last:border-none">
              <td className="px-4 py-3 font-medium">{r.room_number}</td>
              <td className="px-4 py-3">{r.room_type}</td>
              <td className="px-4 py-3 text-right">{r.bookings}</td>
              <td className="px-4 py-3 text-right">{r.nights}</td>
              <td className="px-4 py-3 text-right font-semibold">
                ${Number(r.revenue ?? 0).toLocaleString()}
              </td>

              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => goDetail(r)}
                  className="text-orange-600 font-semibold hover:underline"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
