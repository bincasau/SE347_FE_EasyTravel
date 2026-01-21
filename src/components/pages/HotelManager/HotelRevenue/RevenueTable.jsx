function fmtMoney(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") : "0";
}

function fmtDate(s) {
  if (!s) return "-";
  // backend tra "YYYY-MM-DD" -> hien thi gon
  return String(s);
}

export default function RevenueTable({ data = [] }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">Nhận phòng</th>
            <th className="px-4 py-3 text-left">Trả phòng</th>

            {/* them 2 cot */}
            <th className="px-4 py-3 text-left">Người đặt</th>
            <th className="px-4 py-3 text-left">Phòng</th>

            <th className="px-4 py-3 text-left">Trạng thái</th>
            <th className="px-4 py-3 text-right">Doanh thu</th>
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
              <tr
                key={b?.bookingId ?? `${b?.checkInDate}-${b?.checkOutDate}`}
                className="border-b last:border-none"
              >
                <td className="px-4 py-3">{fmtDate(b?.checkInDate)}</td>
                <td className="px-4 py-3">{fmtDate(b?.checkOutDate)}</td>

                {/* Booker */}
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{bookerName}</div>
                  <div className="text-xs text-gray-500">
                    {bookerEmail || bookerUsername ? (
                      <>{bookerEmail ? bookerEmail : ""}</>
                    ) : (
                      ""
                    )}
                  </div>
                </td>

                {/* Room */}
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {roomNumber ? `Phong ${roomNumber}` : "Phong -"} - {roomType}
                  </div>
                  <div className="text-xs text-gray-500">
                    {numberOfGuest ? `${numberOfGuest} khach` : ""}
                  </div>
                </td>

                <td className="px-4 py-3 font-medium">{b?.status || "-"}</td>

                <td className="px-4 py-3 text-right font-semibold">
                  {fmtMoney(revenue)} VND
                </td>
              </tr>
            );
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                Không có đặt phòng
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
