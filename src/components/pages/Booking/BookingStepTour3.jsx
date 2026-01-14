import React, { useState } from "react";
import { popup } from "@/utils/popup";

const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function BookingStepTour3({ bookingData, prevStep }) {
  const { user, tickets, total, tourInfo, date } = bookingData;

  const [payment, setPayment] = useState("cash");
  const [bankCode, setBankCode] = useState("");
  const [loading, setLoading] = useState(false);

  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const handleConfirm = async () => {
    if (loading) return;

    const token = getToken();

    // ✅ resolve tourId an toàn
    const realTourId = tourInfo?.tourId ?? tourInfo?.id ?? null;

    if (!realTourId) {
      popup.error("Thiếu tourId (tourInfo bị sai dữ liệu).");
      return;
    }

    const payload = {
      tourId: realTourId,
      adults: tickets?.adult || 0,
      children: tickets?.child || 0,
      totalPrice: total || 0,
      email: user?.email || "",
    };

    try {
      setLoading(true);

      const bookingRes = await fetch("http://localhost:8080/booking/tour", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!bookingRes.ok) {
        const msg = await bookingRes.text().catch(() => "");
        throw new Error(msg || `Booking failed (${bookingRes.status})`);
      }

      const bookingDataRes = await bookingRes.json();
      const bookingId =
        bookingDataRes.bookingId ||
        bookingDataRes.id ||
        bookingDataRes?.data?.bookingId;

      if (!bookingId) {
        popup.error("Booking failed: missing bookingId!");
        return;
      }

      // ✅ CASH
      if (payment === "cash") {
        await popup.success("Booking successfully! Please pay at departure.");
        return;
      }

      // ✅ VNPAY
      if (payment === "vnpay") {
        const params = new URLSearchParams();
        params.append("amount", total || 0);
        params.append("bookingId", bookingId);
        params.append("bookingType", "TOUR");
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
          popup.error(`VNPay request failed: ${payRes.status} ${msg}`);
          return;
        }

        const payData = await payRes.json();
        const paymentUrl = payData?.data?.paymentUrl;

        if (!paymentUrl) {
          popup.error("Cannot get VNPay payment URL!");
          return;
        }

        await popup.success("Đang chuyển hướng đến VNPay...");
        window.location.assign(paymentUrl);
        return;
      }
    } catch (err) {
      console.error("❌ Booking error:", err);
      popup.error(err?.message || "Booking failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Payment & Confirmation
      </h2>

      <div className="border rounded-lg p-4 space-y-2">
        <p>
          <strong>Tour:</strong> {tourInfo?.title}
        </p>
        <p>
          <strong>Date:</strong> {date}
        </p>
        <p>
          <strong>Adult:</strong> {tickets?.adult}
        </p>
        <p>
          <strong>Child:</strong> {tickets?.child}
        </p>
        <p className="text-orange-500 font-semibold text-lg">
          Total: {formatVND(total)}
        </p>
      </div>

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
