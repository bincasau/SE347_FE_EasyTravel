import React, { useState } from "react";
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

  const { room = {}, hotel = {} } = bookingData;

  const [method, setMethod] = useState("");
  const [showModal, setShowModal] = useState(false);

  const nights = bookingData.nights || 1;

  const handleConfirm = async () => {
    if (!method) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    const token =
      localStorage.getItem("jwt") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    try {
      const payload = {
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        totalPrice: bookingData.total,
        hotelId: bookingData.hotel.id,
        roomID: bookingData.room.id,
        gmail: bookingData.user.email,
      };

      const bookingRes = await createHotelBooking(payload);
      console.log("bookingRes =", bookingRes);
      console.log("bookingRes.data =", typeof bookingRes);


      const bookingId =
        bookingRes?.bookingId || bookingRes?.id || bookingRes?.data?.bookingId;

      if (!bookingId) {
        alert("Không lấy được bookingId");
        return;
      }

      if (method === "cash") {
        setShowModal(true);
        return;
      }

      if (method === "vnpay") {
        const params = new URLSearchParams();
        params.append("amount", bookingData.total);
        params.append("bankCode", "NCB");
        params.append("bookingId", bookingId);
        params.append("bookingType", "HOTEL");

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
          alert("VNPay request failed");
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
      alert("Lỗi khi đặt phòng");
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
                src={getRoomImage(room.image_bed)}
                alt={room.type}
                className="w-20 h-16 rounded-md object-cover"
              />

              <div className="text-sm leading-snug">
                <div className="font-medium text-gray-800">
                  {hotel.name} – {room.type} ({room.guests} khách)
                </div>
                <div className="text-xs text-gray-500">{hotel.address}</div>
              </div>
            </div>

            <hr className="my-3" />

            <div className="text-sm space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>
                  {nights} đêm · {room.type}
                </span>
                <span className="font-medium">
                  {formatVND(room.price * nights)}
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
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium"
            >
              Xác nhận & Thanh toán
            </button>
          </div>
        </aside>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-2">Đặt phòng thành công</h2>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã sử dụng EasyTravel
            </p>

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
