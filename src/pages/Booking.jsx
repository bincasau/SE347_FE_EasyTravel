import React, { useState } from "react";
import BookingStep1 from "../components/pages/Booking/BookingStep1";
import BookingStep2 from "../components/pages/Booking/BookingStep2";
import BookingStep3 from "../components/pages/Booking/BookingStep3";

export default function BookingFlow() {
  const [step, setStep] = useState(1);

  // lưu dữ liệu giữa các bước
  const [bookingData, setBookingData] = useState({
    date: "2022-12-23",
    time: "15:00",
    tickets: {
      adult: 2,
      child: 1,
      infant: 1,
    },
    total: 86,
    user: {
      name: "",
      surname: "",
      phone: "",
      email: "",
    },
  });

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-10 mb-10 text-sm">
        {[
          { n: 1, label: "Booking Details" },
          { n: 2, label: "Your Details" },
          { n: 3, label: "Payment" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full grid place-items-center ${
                step === s.n
                  ? "bg-orange-500 text-white"
                  : step > s.n
                  ? "bg-orange-100 text-orange-500"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {s.n}
            </div>
            <span
              className={`${
                step === s.n
                  ? "text-orange-500 font-medium"
                  : "text-gray-500"
              }`}
            >
              {s.label}
            </span>
            {i < 2 && <div className="w-28 h-[2px] bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="max-w-6xl mx-auto px-6">
        {step === 1 && (
          <BookingStep1
            bookingData={bookingData}
            setBookingData={setBookingData}
            nextStep={nextStep}
          />
        )}
        {step === 2 && (
          <BookingStep2
            bookingData={bookingData}
            setBookingData={setBookingData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 3 && (
          <BookingStep3
            bookingData={bookingData}
            setBookingData={setBookingData}
            prevStep={prevStep}
          />
        )}
      </div>
    </div>
  );
}
