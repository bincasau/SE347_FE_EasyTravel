import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createHotelBooking, getVnpayPaymentUrl } from "@/apis/Booking";
import { popup } from "@/utils/popup";

const AWS_ROOM_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";

const formatVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")}₫`;

const getRoomImage = (imageBed) =>
  imageBed
    ? `${AWS_ROOM_IMAGE_BASE}/${imageBed}`
    : `${AWS_ROOM_IMAGE_BASE}/standard_bed.jpg`;

export default function BookingStep3({ bookingData, prevStep }) {
  const navigate = useNavigate();

  const safeData = bookingData || {};
  const room = safeData.room || {};
  const hotel = safeData.hotel || {};

  const realHotelId = useMemo(
    () => hotel?.hotelId ?? hotel?.id ?? null,
    [hotel],
  );
  const realRoomId = useMemo(() => room?.roomId ?? room?.id ?? null, [room]);

  const roomImageBed = room?.image_bed ?? room?.imageBed ?? "";

  const [bankCode, setBankCode] = useState("");
  const [loading, setLoading] = useState(false);

  const nights = safeData.nights || 1;

  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const handleConfirm = async () => {
    if (loading) return;

    if (!realHotelId || !realRoomId) {
      popup.error("Thiếu hotelId hoặc roomId (bookingData bị sai).");
      return;
    }

    const gmail =
      safeData?.user?.email ||
      safeData?.user?.gmail ||
      safeData?.user?.mail ||
      "";

    if (!gmail) {
      popup.error("Thiếu email người đặt.");
      return;
    }

    try {
      setLoading(true);

      // 1) Tạo booking trước
      const payload = {
        checkInDate: safeData.checkInDate,
        checkOutDate: safeData.checkOutDate,
        totalPrice: safeData.total,
        hotelId: realHotelId,
        roomID: realRoomId,
        gmail,
      };

      const bookingRes = await createHotelBooking(payload);

      const bookingId =
        bookingRes?.bookingId ||
        bookingRes?.id ||
        bookingRes?.data?.bookingId ||
        bookingRes?.data?.id;

      if (!bookingId) {
        popup.error("Không lấy được bookingId");
        return;
      }

      // 2) Xin link VNPay (đã tách fetch ra Booking API)
      const token = getToken();
      const paymentUrl = await getVnpayPaymentUrl({
        amount: safeData.total || 0,
        bookingId,
        bookingType: "HOTEL",
        bankCode: bankCode || "",
        token,
      });

      if (!paymentUrl) {
        popup.error("Không lấy được link VNPay");
        return;
      }

      await popup.success("Đang chuyển hướng đến VNPay...");
      window.location.assign(paymentUrl);
    } catch (err) {
      console.error("❌ Hotel booking error:", err);
      popup.error(err?.message || "Lỗi khi đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Chọn phương thức thanh toán
          </h2>

          <div className="space-y-4">
            <div className="border rounded-lg p-4 border-orange-500 bg-orange-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" checked readOnly />
                <span className="font-medium text-orange-600">
                  Thanh toán qua VNPay
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Chuyển hướng đến cổng thanh toán
              </p>

              <div className="pt-3 ml-6">
                <label className="block text-sm text-gray-700 mb-1">
                  Chọn ngân hàng (không bắt buộc)
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Auto / Let VNPay choose</option>
                  <option value="NCB">NCB</option>
                  <option value="VNPAYQR">VNPAYQR</option>
                  <option value="VIETCOMBANK">Vietcombank</option>
                  <option value="VIETINBANK">Vietinbank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="AGRIBANK">Agribank</option>
                  <option value="SACOMBANK">Sacombank</option>
                  <option value="ACB">ACB</option>
                  <option value="TECHCOMBANK">Techcombank</option>
                  <option value="MB">MB</option>
                  <option value="VPBANK">VPBank</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Nếu không chọn ngân hàng, VNPay sẽ hiển thị danh sách trong
                  bước thanh toán.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={prevStep}
            className="rounded-full border mt-3 border-gray-300 text-gray-600 px-6 py-2 hover:bg-gray-50"
            disabled={loading}
          >
            Back
          </button>
        </div>

        <aside className="md:col-span-2">
          <div className="rounded-2xl border bg-white shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Tóm tắt đặt phòng
            </h3>

            <div className="flex gap-3 mb-4">
              <img
                src={getRoomImage(roomImageBed)}
                alt={room.type || room.roomType || "room"}
                className="w-20 h-16 rounded-md object-cover"
              />

              <div className="text-sm leading-snug">
                <div className="font-medium text-gray-800">
                  {hotel.name} – {room.type || room.roomType} (
                  {room.guests || room.numberOfGuest} khách)
                </div>
                <div className="text-xs text-gray-500">{hotel.address}</div>
              </div>
            </div>

            <hr className="my-3" />

            <div className="text-sm space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>
                  {nights} đêm · {room.type || room.roomType}
                </span>
                <span className="font-medium">
                  {formatVND((room.price || 0) * nights)}
                </span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-sm font-semibold mb-4">
              <span>Tổng tiền</span>
              <span className="text-orange-500">
                {formatVND(safeData.total)}
              </span>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 font-medium"
            >
              {loading ? "Đang xử lý..." : "Thanh toán qua VNPay"}
            </button>
          </div>
        </aside>
      </section>
    </>
  );
}
