import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHotelBooking } from "@/apis/Booking";

export default function BookingStep3({ bookingData, prevStep }) {
  const navigate = useNavigate();

  const [method, setMethod] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [showModal, setShowModal] = useState(false);

  // ---------- Validate Card ----------
  const validateCard = () => {
    const cardRegex = /^[0-9]{16}$/;
    const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^[0-9]{3}$/;

    return (
      cardRegex.test(card.number.trim()) &&
      expRegex.test(card.expiry.trim()) &&
      cvvRegex.test(card.cvv.trim())
    );
  };

  // ---------- Handle Confirm ----------
  const handleConfirm = async () => {
    // Chưa chọn phương thức
    if (!method) {
      return alert("❌ Vui lòng chọn phương thức thanh toán!");
    }

    // Validate thẻ
    if (method === "card" && !validateCard()) {
      return alert("❌ Vui lòng nhập thông tin thẻ hợp lệ!");
    }

    // Nếu hợp lệ → tiến hành thanh toán
    await finishPayment();
  };

  // ---------- Finish Payment ----------
  const finishPayment = async () => {
    try {
      const payload = {
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        totalPrice: bookingData.total,
        hotelId: bookingData.hotel.id,
        roomID: bookingData.room.id,
        gmail: bookingData.user.email,
      };

      // gọi API
      const res = await createHotelBooking(payload);

      //  nếu API trả về success → mở popup
      setShowModal(true);
    } catch (err) {
      // ❌ lỗi → KHÔNG mở popup, chỉ báo lỗi
      alert("❌ Lỗi khi lưu booking: " + err.message);
    }
  };

  return (
    <>
      <section className="grid md:grid-cols-5 gap-8">
        {/* LEFT */}
        <div className="md:col-span-3 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Chọn phương thức thanh toán
          </h2>

          <div className="space-y-4">
            {/* PAYPAL */}
            <div
              className={`border rounded-lg p-4 cursor-pointer ${
                method === "paypal" ? "border-orange-500 bg-orange-50" : ""
              }`}
              onClick={() => setMethod("paypal")}
            >
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={method === "paypal"}
                  readOnly
                />
                <span className="font-medium">PayPal</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Bạn sẽ được chuyển hướng.
              </p>
            </div>

            {/* CARD */}
            <div
              className={`border rounded-lg p-4 cursor-pointer ${
                method === "card" ? "border-orange-500 bg-orange-50" : ""
              }`}
              onClick={() => setMethod("card")}
            >
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={method === "card"}
                  readOnly
                />
                <span className="font-semibold text-orange-600">
                  Thanh toán bằng thẻ tín dụng
                </span>
              </label>

              {method === "card" && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="col-span-2 flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">
                      Card Number
                    </label>
                    <input
                      value={card.number}
                      onChange={(e) =>
                        setCard({ ...card, number: e.target.value })
                      }
                      placeholder="1111222233334444"
                      maxLength={16}
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">
                      Expiration MM/YY
                    </label>
                    <input
                      value={card.expiry}
                      onChange={(e) =>
                        setCard({ ...card, expiry: e.target.value })
                      }
                      placeholder="09/26"
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">CVV</label>
                    <input
                      value={card.cvv}
                      onChange={(e) =>
                        setCard({ ...card, cvv: e.target.value })
                      }
                      placeholder="123"
                      maxLength={3}
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={prevStep}
            className="rounded-full border mt-3 border-gray-300 text-gray-600 px-6 py-2 hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        {/* RIGHT SUMMARY */}
        <aside className="md:col-span-2">
          <div className="rounded-2xl border bg-white shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Booking Summary
            </h3>

            <div className="flex gap-3 mb-4">
              <img
                src={`/images/room/${
                  bookingData.room.image_bed || "standard.jpg"
                }`}
                className="w-20 h-16 rounded-md object-cover"
              />
              <div>
                <div className="font-medium text-gray-800">
                  {bookingData.room.type} ({bookingData.room.guests} khách)
                </div>
                <div className="text-xs text-gray-500">
                  📅 {bookingData.checkInDate} → {bookingData.checkOutDate}
                </div>
              </div>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between text-sm">
              <span>Tiền phòng</span>
              <span>{bookingData.total.toLocaleString("vi-VN")}₫</span>
            </div>

            <hr className="my-4" />

            <button
              onClick={handleConfirm}
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium"
            >
              Xác nhận & Thanh toán
            </button>
          </div>
        </aside>
      </section>

      {/* SUCCESS MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <div className="text-green-500 text-4xl mb-3">✔</div>
            <h2 className="text-xl font-semibold mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã đặt phòng tại EasyTravel.
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
