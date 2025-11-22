import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BookingStep1 from "@/components/pages/Booking/BookingStep1";
import BookingStep2 from "@/components/pages/Booking/BookingStep2";
import BookingStep3 from "@/components/pages/Booking/BookingStep3";

export default function RoomBooking() {
  const [step, setStep] = useState(1);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const hotelId = parseInt(params.get("hotel"), 10);
  const roomId = parseInt(params.get("room"), 10);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Dữ liệu booking mặc định
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    room: {
      id: null,
      type: "",
      price: 0,
      desc: "",
      guests: 0,
      image_bed: "",
    },
    total: 0,
    user: {
      name: "",
      surname: "",
      phone: "",
      email: "",
    },
  });

  // ✅ Fetch dữ liệu phòng
  useEffect(() => {
    if (!hotelId || !roomId) {
      setError("Thiếu thông tin phòng hoặc khách sạn.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`http://localhost:8080/hotels/${hotelId}/rooms/${roomId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải dữ liệu phòng");
        return res.json();
      })
      .then((room) => {
        setBookingData((prev) => ({
          ...prev,
          room: {
            id: room.roomId,
            type: room.roomType,
            price: room.price,
            desc: room.desc,
            guests: room.numberOfGuest,
            image_bed: room.image_bed || "standard.jpg",
          },
          total: room.price,
        }));
      })
      .catch((err) => {
        console.error("Error fetching room:", err);
        setError("Không thể tải thông tin phòng, vui lòng thử lại.");
      })
      .finally(() => setIsLoading(false));
  }, [hotelId, roomId]);

  // ✅ Điều hướng giữa các bước
  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // ✅ UI hiển thị tiến trình (stepper)
  const Stepper = () => (
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
              step === s.n ? "text-orange-500 font-medium" : "text-gray-500"
            }`}
          >
            {s.label}
          </span>
          {i < 2 && <div className="w-28 h-[2px] bg-gray-200" />}
        </div>
      ))}
    </div>
  );

  // ✅ Render từng bước
  const renderStep = () => {
    if (isLoading)
      return (
        <p className="text-center text-gray-400 animate-pulse">
          Đang tải dữ liệu phòng...
        </p>
      );

    if (error)
      return <p className="text-center text-red-500 font-medium">{error}</p>;

    switch (step) {
      case 1:
        return (
          <BookingStep1
            bookingData={bookingData}
            setBookingData={setBookingData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <BookingStep2
            bookingData={bookingData}
            setBookingData={setBookingData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <BookingStep3
            bookingData={bookingData}
            setBookingData={setBookingData}
            prevStep={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <Stepper />
      <div className="max-w-6xl mx-auto px-6">{renderStep()}</div>
    </div>
  );
}
