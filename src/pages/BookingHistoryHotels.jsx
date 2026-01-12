import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

// TODO: thay bằng API thật của bạn
async function fetchHotelBookingHistory() {
  // Ví dụ:
  // const res = await fetchWithJWT(`${BASE_URL}/bookings/hotels/my`, { method: "GET" });
  // if (!res.ok) throw new Error("Failed");
  // return res.json();

  return []; // mock empty
}

export default function BookingHistoryHotels() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchHotelBookingHistory();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setRows([]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Hotel booking history</h1>

        <div className="flex items-center gap-2">
          <NavLink
            to="/booking-history/tours"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl border ${
                isActive ? "bg-orange-500 text-white border-orange-500" : "bg-white"
              }`
            }
          >
            Tours
          </NavLink>
          <NavLink
            to="/booking-history/hotels"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl border ${
                isActive ? "bg-orange-500 text-white border-orange-500" : "bg-white"
              }`
            }
          >
            Hotels
          </NavLink>
        </div>
      </div>

      <div className="mt-6 bg-white border rounded-2xl overflow-hidden">
        <div className="p-4 border-b text-sm text-gray-600">
          {loading ? "Loading..." : `${rows.length} record(s)`}
        </div>

        {loading ? (
          <div className="p-6 text-gray-500">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-gray-500">
            No hotel bookings yet.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-600">
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Hotel</th>
                  <th className="p-4">Check-in</th>
                  <th className="p-4">Check-out</th>
                  <th className="p-4">Rooms</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-4">{r.id}</td>
                    <td className="p-4">{r.hotelName}</td>
                    <td className="p-4">{r.checkin}</td>
                    <td className="p-4">{r.checkout}</td>
                    <td className="p-4">{r.rooms}</td>
                    <td className="p-4">{r.total}</td>
                    <td className="p-4">{r.status}</td>
                    <td className="p-4">
                      <button
                        className="text-orange-600 hover:underline"
                        onClick={() => navigate(`/booking/hotel/${r.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
