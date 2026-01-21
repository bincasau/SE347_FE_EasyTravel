function fmtMoney(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") : "0";
}

function fmtDate(s) {
  if (!s) return "-";
  // backend trả "YYYY-MM-DD" -> hiển thị gọn
  return String(s);
}

export default function RevenueTable({ data = [] }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">Check-in</th>
            <th className="px-4 py-3 text-left">Check-out</th>

            {/* ✅ thêm 2 cột */}
            <th className="px-4 py-3 text-left">Booker</th>
            <th className="px-4 py-3 text-left">Room</th>

            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Revenue</th>
          </tr>
        </thead>

        <tbody>
          {data.map((b) => {
            const revenue = b?.payment?.totalPrice ?? b?.totalPrice ?? 0;

            const bookerName = b?.user?.name ?? "-";
            const bookerEmail = b?.user?.email ?? "";
            const bookerUsername = b?.user?.username ?? "";

            const roomType = b?.room?.roomType ?? "-";
            const roomNumber =
              b?.room?.roomNumber !== undefined && b?.room?.roomNumber !== null
                ? String(b.room.roomNumber)
                : "";
            const numberOfGuest =
              b?.room?.numberOfGuest !== undefined && b?.room?.numberOfGuest !== null
                ? String(b.room.numberOfGuest)
                : "";

            return (
              <tr key={b?.bookingId ?? `${b?.checkInDate}-${b?.checkOutDate}`} className="border-b last:border-none">
                <td className="px-4 py-3">{fmtDate(b?.checkInDate)}</td>
                <td className="px-4 py-3">{fmtDate(b?.checkOutDate)}</td>

                {/* ✅ Booker */}
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{bookerName}</div>
                  <div className="text-xs text-gray-500">
                    {bookerEmail || bookerUsername ? (
                      <>
                        {bookerEmail ? bookerEmail : ""}
                        
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                </td>

                {/* ✅ Room */}
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {roomNumber ? `Room ${roomNumber}` : "Room -"} · {roomType}
                  </div>
                  <div className="text-xs text-gray-500">
                    {numberOfGuest ? `${numberOfGuest} guests` : ""}
                  </div>
                </td>

                <td className="px-4 py-3 font-medium">{b?.status || "-"}</td>

                <td className="px-4 py-3 text-right font-semibold">
                  {fmtMoney(revenue)}₫
                </td>
              </tr>
            );
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                No bookings
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
