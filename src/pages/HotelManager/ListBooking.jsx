import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ListBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const room = location.state?.room; // ✅ data từ RevenueTable

  // ✅ mock booking list (sau thay bằng API)
  const [bookings] = useState([
    {
      booking_id: 1001,
      guest_name: "Nguyễn Văn A",
      check_in: "2024-09-02",
      check_out: "2024-09-05",
      nights: 3,
      total: 300,
      status: "PAID",
    },
    {
      booking_id: 1002,
      guest_name: "Trần Thị B",
      check_in: "2024-09-10",
      check_out: "2024-09-12",
      nights: 2,
      total: 220,
      status: "PENDING",
    },
  ]);

  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => sum + Number(b.total ?? 0), 0);
  }, [bookings]);

  // ✅ phòng không có state (user refresh)
  if (!room) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 border border-orange-500 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50"
          >
            ← Back
          </button>

          <div className="bg-white border rounded-xl p-6 text-center text-gray-600">
            Không có dữ liệu phòng (bạn vừa refresh trang). <br />
            Vui lòng quay lại Revenue và bấm View lại.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="border border-orange-500 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50"
            >
              ← Back
            </button>

            <div className="text-center flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                Bookings Detail
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Room <span className="font-semibold">{room.room_number}</span> •{" "}
                {room.room_type}
              </p>
            </div>

            <div className="w-[110px]" />
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Summary */}
        <div className="bg-white border rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Total bookings</div>
            <div className="text-xl font-semibold text-gray-900">
              {bookings.length}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 text-right">Total revenue</div>
            <div className="text-xl font-semibold text-orange-600 text-right">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Guest</th>
                <th className="px-4 py-3 text-left">Check-in</th>
                <th className="px-4 py-3 text-left">Check-out</th>
                <th className="px-4 py-3 text-right">Nights</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.booking_id} className="border-b last:border-none">
                  <td className="px-4 py-3 font-medium">{b.booking_id}</td>
                  <td className="px-4 py-3">{b.guest_name}</td>
                  <td className="px-4 py-3">{b.check_in}</td>
                  <td className="px-4 py-3">{b.check_out}</td>
                  <td className="px-4 py-3 text-right">{b.nights}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${Number(b.total ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={[
                        "px-2 py-1 rounded-full text-xs font-semibold border",
                        b.status === "PAID"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-800 border-yellow-200",
                      ].join(" ")}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookings.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No bookings found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
