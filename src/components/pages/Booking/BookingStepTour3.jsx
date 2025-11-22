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

    const payload = {
      tourId: tourInfo.tourId,
      adultCount: tickets.adult,
      childCount: tickets.child,
      fullName: `${user.name} ${user.surname}`,
      phone: user.phone,
      email: user.email,
      travelDate: date,
      travelTime: null,
      totalPrice: total,
      paymentMethod: payment,
    };

    try {
      const res = await fetch("http://localhost:8080/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Booking failed");
      }

      alert("🎉 Booking successfully!");
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

      {/* PAYMENT METHOD */}
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
            checked={payment === "momo"}
            onChange={() => setPayment("momo")}
          />
          MOMO Wallet
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

      {/* SHOW QR WHEN NEEDED */}
      {payment === "momo" && (
        <div className="text-center">
          <h3 className="font-semibold mb-2">Scan MOMO QR</h3>
          <img
            src="/qr/momo.png"
            className="w-64 mx-auto rounded-lg shadow"
            alt="MOMO QR"
          />
        </div>
      )}

      {payment === "vnpay" && (
        <div className="text-center">
          <h3 className="font-semibold mb-2">Scan VNPay QR</h3>
          <img
            src="/qr/vnpay.png"
            className="w-64 mx-auto rounded-lg shadow"
            alt="VNPay QR"
          />
        </div>
      )}

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
