import React, { useState } from "react";

const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function BookingStepTour3({ bookingData, prevStep }) {
  const { user, tickets, total, tourInfo, date } = bookingData;

  const [payment, setPayment] = useState("cash");

  const handleConfirm = async () => {
    const token =
      localStorage.getItem("jwt") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    // ✅ Payload đúng DTO BookingTourRequest
    const payload = {
      tourId: tourInfo.tourId,
      adults: tickets.adult,
      children: tickets.child,
      totalPrice: total,
      email: user.email,
    };

    try {
      // 1️⃣ Gửi booking tour
      const bookingRes = await fetch("http://localhost:8080/booking/tour", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!bookingRes.ok) throw new Error(await bookingRes.text());

      const bookingData = await bookingRes.json();
      console.log("📌 Booking response:", bookingData);

      const bookingId =
        bookingData.bookingId || bookingData.id || bookingData?.data?.bookingId;

      if (!bookingId) {
        alert("❌ Booking failed: missing bookingId!");
        return;
      }

      // 2️⃣ Nếu chọn thanh toán CASH → xong luôn
      if (payment === "cash") {
        alert("🎉 Booking successfully! Please pay at departure.");
        return;
      }

      // 3️⃣ Nếu chọn VNPay → gọi /payment/vn-pay
      if (payment === "vnpay") {
        const params = new URLSearchParams();
        params.append("amount", total);          // số tiền
        params.append("bankCode", "NCB");        // bankCode demo
        params.append("bookingId", bookingId);   // id booking mới tạo
        params.append("bookingType", "TOUR");    // nếu BE yêu cầu HOTEL thì đổi lại

        const vnpApi = `http://localhost:8080/payment/vn-pay?${params.toString()}`;
        console.log("📌 VNPay request URL:", vnpApi);

        const payRes = await fetch(vnpApi, {
          method: "GET",
          headers: {
            // 💥 QUAN TRỌNG: gửi kèm JWT, nếu không Spring Security sẽ 403
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!payRes.ok) {
          console.error("❌ VNPay API Error:", payRes.status);
          alert("VNPay request failed: " + payRes.status);
          return;
        }

        const payData = await payRes.json();
        console.log("📌 VNPay response:", payData);

        const paymentUrl = payData?.data?.paymentUrl;
        if (!paymentUrl) {
          alert("❌ Cannot get VNPay payment URL!");
          return;
        }

        alert("Redirecting to VNPay...");
        window.location.href = paymentUrl;
        return;
      }
    } catch (err) {
      console.error("❌ Booking error:", err);
      alert("Booking failed!");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Payment & Confirmation
      </h2>

      {/* SUMMARY */}
      <div className="border rounded-lg p-4 space-y-2">
        <p><strong>Tour:</strong> {tourInfo.title}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Adult:</strong> {tickets.adult}</p>
        <p><strong>Child:</strong> {tickets.child}</p>
        <p className="text-orange-500 font-semibold text-lg">
          Total: {formatVND(total)}
        </p>
      </div>

      {/* PAYMENT */}
      <div className="border rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="payment"
            checked={payment === "cash"}
            onChange={() => setPayment("cash")}
          />
          Cash (Pay at departure)
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="payment"
            checked={payment === "vnpay"}
            onChange={() => setPayment("vnpay")}
          />
          VNPay
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Back
        </button>

        <button
          onClick={handleConfirm}
          className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          Complete Booking
        </button>
      </div>
    </div>
  );
}
