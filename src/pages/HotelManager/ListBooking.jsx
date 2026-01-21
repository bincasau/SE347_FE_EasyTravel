import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "@/utils/Pagination";

function formatDateVN(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("vi-VN");
}

function formatMoneyVND(value) {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString("vi-VN")}₫`;
}

function statusText(status) {
  const s = String(status || "").toUpperCase();
  if (s === "PAID") return "Đã thanh toán";
  if (s === "PENDING") return "Chờ thanh toán";
  if (s === "CANCELLED") return "Đã huỷ";
  return s || "-";
}

export default function ListBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const room = location.state?.room;

  // Demo data (bạn thay bằng API sau)
  const [bookings] = useState([
    {
      booking_id: 1001,
      guest_name: "Nguyễn Văn A",
      check_in: "2024-09-02",
      check_out: "2024-09-05",
      nights: 3,
      total: 3000000,
      status: "PAID",
    },
    {
      booking_id: 1002,
      guest_name: "Trần Thị B",
      check_in: "2024-09-10",
      check_out: "2024-09-12",
      nights: 2,
      total: 2200000,
      status: "PENDING",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(bookings.length / pageSize));
  }, [bookings.length]);

  // Nếu số trang giảm (do filter/xoá), đảm bảo currentPage không vượt quá totalPages
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const pagedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return bookings.slice(start, end);
  }, [bookings, currentPage]);

  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => sum + Number(b.total ?? 0), 0);
  }, [bookings]);

  if (!room) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 border border-orange-500 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50"
          >
            Quay lại
          </button>

          <div className="bg-white border rounded-xl p-6 text-center text-gray-600">
            Không có dữ liệu phòng (bạn vừa refresh trang).
            <br />
            Vui lòng quay lại trang Doanh thu và bấm <b>Xem</b> lại.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="border border-orange-500 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50"
            >
              Quay lại
            </button>

            <div className="text-center flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                Chi tiết đặt phòng
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Phòng{" "}
                <span className="font-semibold">{room.room_number}</span> —{" "}
                {room.room_type}
              </p>
            </div>

            <div className="w-[110px]" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white border rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Tổng lượt đặt</div>
            <div className="text-xl font-semibold text-gray-900">
              {bookings.length}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 text-right">
              Tổng doanh thu
            </div>
            <div className="text-xl font-semibold text-orange-600 text-right">
              {formatMoneyVND(totalRevenue)}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Mã đặt phòng</th>
                <th className="px-4 py-3 text-left">Khách</th>
                <th className="px-4 py-3 text-left">Nhận phòng</th>
                <th className="px-4 py-3 text-left">Trả phòng</th>
                <th className="px-4 py-3 text-right">Số đêm</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3 text-right">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {pagedBookings.map((b) => (
                <tr key={b.booking_id} className="border-b last:border-none">
                  <td className="px-4 py-3 font-medium">{b.booking_id}</td>
                  <td className="px-4 py-3">{b.guest_name}</td>
                  <td className="px-4 py-3">{formatDateVN(b.check_in)}</td>
                  <td className="px-4 py-3">{formatDateVN(b.check_out)}</td>
                  <td className="px-4 py-3 text-right">{b.nights}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatMoneyVND(b.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={[
                        "px-2 py-1 rounded-full text-xs font-semibold border",
                        String(b.status).toUpperCase() === "PAID"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-800 border-yellow-200",
                      ].join(" ")}
                    >
                      {statusText(b.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookings.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Không có đặt phòng nào.
            </div>
          )}
        </div>

        {bookings.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
