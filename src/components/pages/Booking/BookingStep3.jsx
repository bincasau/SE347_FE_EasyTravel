import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createHotelBooking } from "@/apis/Booking";

const AWS_ROOM_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";

const formatVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")}₫`;

const getRoomImage = (imageBed) =>
  imageBed
    ? `${AWS_ROOM_IMAGE_BASE}/${imageBed}`
    : `${AWS_ROOM_IMAGE_BASE}/standard_bed.jpg`;

export default function BookingStep3({ bookingData, prevStep }) {
  const navigate = useNavigate();

  const { room = {}, hotel = {} } = bookingData || {};

  // ✅ resolve id an toàn (room/hotel hay bị lệch key)
  const realHotelId = useMemo(
    () => hotel?.hotelId ?? hotel?.id ?? null,
    [hotel]
  );

  const realRoomId = useMemo(
    () => room?.roomId ?? room?.id ?? null,
    [room]
  );

  const roomImageBed = room?.image_bed ?? room?.imageBed ?? "";

  const [method, setMethod] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nights = bookingData?.nights || 1;

  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const handleConfirm = async () => {
    if (!method) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!realHotelId || !realRoomId) {
      alert("Thiếu hotelId hoặc roomId (URL/bookingData đang sai).");
      return;
    }

    const email =
      bookingData?.user?.email ||
      bookingData?.user?.gmail || // fallback nếu bạn lưu gmail
      "";

    if (!email) {
      alert("Thiếu email người đặt (cần đăng nhập / điền email).");
      return;
    }

    if (submitting) return;

    const token = getToken();

    try {
      setSubmitting(true);

      const payload = {
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        totalPrice: bookingData.total,

        // ✅ luôn dùng id thật
        hotelId: realHotelId,

        // ✅ khuyến nghị dùng roomId (nếu BE bạn bắt buộc roomID thì đổi key này lại)
        roomId: realRoomId,

        // ✅ email
        email,
      };

      // ✅ tạo booking
      const bookingRes = await createHotelBooking(payload);

      // bookingRes có thể là axios response hoặc object thuần
      const bookingId =
        bookingRes?.bookingId ||
        bookingRes?.id ||
        bookingRes?.data?.bookingId ||
        bookingRes?.data?.id;

      if (!bookingId) {
        console.log("bookingRes =", bookingRes);
        alert("Không lấy được bookingId (check response BE)");
        return;
      }

      // ✅ CASH
      if (method === "cash") {
        setShowModal(true);
        return;
      }

      // ✅ VNPAY
      if (method === "vnpay") {
        const params = new URLSearchParams();
        params.append("amount", bookingData.total);
        params.append("bookingId", bookingId);
        params.append("bookingType", "HOTEL");
        // bankCode optional
        params.append("bankCode", "NCB");

        const payRes = await fetch(
          `http://localhost:8080/payment/vn-pay?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!payRes.ok) {
          const msg = await payRes.text().catch(() => "");
          alert(`VNPay request failed: ${payRes.status} ${msg}`);
          return;
        }

        const payData = await payRes.json();
        const paymentUrl = payData?.data?.paymentUrl;

        if (!paymentUrl) {
          alert("Không lấy được link VNPay");
          return;
        }

        window.location.href = paymentUrl;
      }
    } catch (err) {
      console.error("❌ Hotel booking error:", err);
      alert("Lỗi khi đặt phòng");
    } finally {
      setSubmitting(false);
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
            <div
              className={`border rounded-lg p-4 cursor-pointer ${
                method === "cash" ? "border-orange-500 bg-orange-50" : ""
              }`}
              onClick={() => setMethod("cash")}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" checked={method === "cash"} readOnly />
                <span className="font-medium">Thanh toán tiền mặt</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Thanh toán khi nhận phòng
              </p>
            </div>

            <div
              className={`border rounded-lg p-4 cursor-pointer ${
                method === "vnpay" ? "border-orange-500 bg-orange-50" : ""
              }`}
              onClick={() => setMethod("vnpay")}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" checked={method === "vnpay"} readOnly />
                <span className="font-medium text-orange-600">
                  Thanh toán qua VNPay
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Chuyển hướng đến cổng thanh toán
              </p>
            </div>
          </div>

          <button
            onClick={prevStep}
            className="rounded-full border mt-3 border-gray-300 text-gray-600 px-6 py-2 hover:bg-gray-50"
            disabled={submitting}
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
                  {hotel.name} –{" "}
                  {room.type || room.roomType} (
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
                {formatVND(bookingData.total)}
              </span>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 font-medium"
            >
              {submitting ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
            </button>
          </div>
        </aside>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-2">Đặt phòng thành công</h2>
            <p className="text-gray-600 mb-4">Cảm ơn bạn đã sử dụng EasyTravel</p>

            <button
              onClick={() => navigate("/hotels")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}
    </>
  );
}
