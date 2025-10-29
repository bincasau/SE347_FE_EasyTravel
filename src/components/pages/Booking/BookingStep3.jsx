import React from "react";
import { useNavigate } from "react-router-dom";
import imgMain from "../../../assets/images/Tour/Booking.jpg";

export default function BookingStep3({ bookingData, prevStep }) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    alert("✅ Payment successful! Thank you for your booking.");
    navigate("/tours");
  };

  return (
    <section className="grid md:grid-cols-5 gap-8">
      {/* LEFT PAYMENT FORM */}
      <div className="md:col-span-3 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Select a payment method
        </h2>

        <div className="space-y-4">
          {/* PayPal */}
          <div className="border rounded-lg p-4 hover:shadow-sm transition">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="payment" />
              <span className="font-medium">PayPal</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              You will be redirected to the PayPal website after submitting your
              order.
            </p>
          </div>

          {/* Credit Card */}
          <div className="border rounded-lg p-4 bg-orange-50 border-orange-200 shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="payment" checked readOnly />
              <span className="font-semibold text-orange-600">
                Pay with Credit Card
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">
                  Card Number
                </label>
                <input
                  placeholder="XXXX XXXX XXXX XXXX"
                  className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">
                  Expiration Date
                </label>
                <input
                  placeholder="MM/YY"
                  className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-xs text-gray-600 mb-1">
                  Security Code (CVV)
                </label>
                <input
                  placeholder="123"
                  className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={prevStep}
            className="rounded-full border border-gray-300 text-gray-600 px-6 py-2 hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* RIGHT SUMMARY */}
      <aside className="md:col-span-2">
        <div className="rounded-2xl border bg-white shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Your Tickets Overview
          </h3>

          <div className="flex gap-3 mb-4">
            <img
              src={imgMain}
              alt="tour"
              className="w-20 h-16 rounded-md object-cover"
            />
            <div>
              <div className="font-medium text-gray-800">
                Wine tasting In Tuscany
              </div>
              <div className="text-xs text-gray-500">
                📅 {bookingData.date || "--"}
              </div>
              <div className="text-xs text-gray-500">
                🕒 {bookingData.time || "--"}
              </div>
            </div>
          </div>

          <hr className="my-3" />

          <div className="text-sm space-y-2 text-gray-700">
            {Object.entries(bookingData.tickets).map(([key, qty]) => (
              <div key={key} className="flex justify-between capitalize">
                <span>
                  {qty} {key}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-4" />
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-700">Total Price</span>
            <span className="text-orange-500 font-bold">
              €{bookingData.total}.00
            </span>
          </div>

          {/* ✅ Confirm & Pay button (giống layout Step 1) */}
          <button
            onClick={handleConfirm}
            className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium mt-2"
          >
            Confirm & Pay
          </button>
        </div>
      </aside>
    </section>
  );
}
