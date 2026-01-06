import React, { useState } from "react";

const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function BookingStepTour3({ bookingData, prevStep }) {
  const { user, tickets, total, tourInfo, date } = bookingData;

  const [payment, setPayment] = useState("cash");
  const [bankCode, setBankCode] = useState(""); // ✅ cho chọn ngân hàng
  const [loading, setLoading] = useState(false); // ✅ tránh bấm spam

  const handleConfirm = async () => {
    if (loading) return;

    const token =
      localStorage.getItem("jwt") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    const payload = {
      tourId: tourInfo.tourId,
      adults: tickets.adult,
      children: tickets.child,
      totalPrice: total,
      email: user.email,
    };

    try {
      setLoading(true);

      // 1️⃣ Booking
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
      const bookingId =
        bookingData.bookingId || bookingData.id || bookingData?.data?.bookingId;

      if (!bookingId) {
        alert("❌ Booking failed: missing bookingId!");
        return;
      }

      // 2️⃣ CASH
      if (payment === "cash") {
        alert("🎉 Booking successfully! Please pay at departure.");
        return;
      }

      // 3️⃣ VNPAY
      if (payment === "vnpay") {
        const params = new URLSearchParams();
        params.append("amount", total);
        params.append("bookingId", bookingId);
        params.append("bookingType", "TOUR");

        // ✅ chỉ gửi bankCode nếu user chọn (để BE tự default hoặc hiển thị chọn bank trên VNPay)
        if (bankCode) params.append("bankCode", bankCode);

        const vnpApi = `http://localhost:8080/payment/vn-pay?${params.toString()}`;

        const payRes = await fetch(vnpApi, {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!payRes.ok) {
          const msg = await payRes.text().catch(() => "");
          alert(`VNPay request failed: ${payRes.status} ${msg}`);
          return;
        }

        const payData = await payRes.json();
        const paymentUrl = payData?.data?.paymentUrl;

        if (!paymentUrl) {
          alert("❌ Cannot get VNPay payment URL!");
          return;
        }

        // ✅ Redirect thẳng — không popup
        window.location.assign(paymentUrl);
        return;
      }
    } catch (err) {
      console.error("❌ Booking error:", err);
      alert("Booking failed!");
    } finally {
      setLoading(false);
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
      <div className="border rounded-lg p-4 space-y-3">
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

        {/* ✅ Chọn ngân hàng chỉ khi VNPay */}
        {payment === "vnpay" && (
          <div className="pt-2">
            <label className="block text-sm text-gray-700 mb-1">
              Choose bank (optional)
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
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
              If you don't choose a bank, VNPay will display options during
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
          disabled={loading}
        >
          Back
        </button>

        <button
          onClick={handleConfirm}
          className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Processing..." : "Complete Booking"}
        </button>
      </div>
    </div>
  );
}
