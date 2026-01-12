import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

// TODO: thay bằng API thật của bạn
async function fetchTourBookingHistory() {
  // Ví dụ:
  // const res = await fetchWithJWT(`${BASE_URL}/bookings/tours/my`, { method: "GET" });
  // if (!res.ok) throw new Error("Failed");
  // return res.json();

  return []; // mock empty
}

export default function BookingHistoryTours() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTourBookingHistory();
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
        <h1 className="text-2xl font-semibold">Tour booking history</h1>

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
            No tour bookings yet.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-600">
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Tour</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Guests</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-4">{r.id}</td>
                    <td className="p-4">{r.tourName}</td>
                    <td className="p-4">{r.date}</td>
                    <td className="p-4">{r.guests}</td>
                    <td className="p-4">{r.total}</td>
                    <td className="p-4">{r.status}</td>
                    <td className="p-4">
                      <button
                        className="text-orange-600 hover:underline"
                        onClick={() => navigate(`/booking/tour/${r.id}`)}
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
