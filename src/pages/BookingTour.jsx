import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import BookingStepTour1 from "../components/pages/Booking/BookingStepTour1.jsx";
import BookingStepTour2 from "../components/pages/Booking/BookingStepTour2.jsx";
import BookingStepTour3 from "../components/pages/Booking/BookingStepTour3.jsx";
import BookingSummary from "../components/pages/Booking/BookingSummary.jsx";

export default function BookingPage() {
  const { tourId } = useParams();

  const [step, setStep] = useState(1);
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookingData, setBookingData] = useState({
    tourId,
    tourName: "",
    date: "",
    time: "",
    tickets: { adult: 1, child: 0 },
    total: 0,
    tourInfo: null,

    // UPDATED USER FIELDS
    user: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },

    availableSeats: 0,
    limitSeats: 0,
  });

  /** ===============================
   *  1️⃣ LOAD TOUR DETAIL
   * =============================== */
  useEffect(() => {
    const loadTour = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${tourId}`);
        if (!res.ok) throw new Error("Failed to fetch tour");

        const data = await res.json();

        setTour(data);

        setBookingData((prev) => ({
          ...prev,
          tourInfo: data,
          tourName: data.title,
          date: data.startDate,
          availableSeats: data.availableSeats,
          limitSeats: data.limitSeats,
        }));
      } catch (err) {
        console.error("❌ Tour load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [tourId]);

  /** ===============================
   *  2️⃣ LOAD USER FROM JWT
   * =============================== */
  useEffect(() => {
    const token =
      localStorage.getItem("jwt") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!token) return;

    const loadUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/account/detail", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();

        setBookingData((prev) => ({
          ...prev,
          user: {
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
          },
        }));
      } catch (err) {
        console.error("❌ User load error:", err);
      }
    };

    loadUser();
  }, []);

  /** ===============================
   *  STEP CONTROLLER
   * =============================== */
  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500">
        Đang tải thông tin tour...
      </div>
    );

  if (!tour)
    return (
      <div className="text-center mt-20 text-red-500">
        Không tìm thấy tour.
      </div>
    );

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-semibold text-gray-800 mb-8">
        Đặt tour: {tour.title}
      </h1>

      <section className="grid md:grid-cols-4 gap-8">
        {/* LEFT PANEL */}
        <div className="md:col-span-3">
          {step === 1 && (
            <BookingStepTour1
              bookingData={bookingData}
              setBookingData={setBookingData}
              nextStep={nextStep}
            />
          )}

          {step === 2 && (
            <BookingStepTour2
              bookingData={bookingData}
              setBookingData={setBookingData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {step === 3 && (
            <BookingStepTour3 bookingData={bookingData} prevStep={prevStep} />
          )}
        </div>

        {/* RIGHT PANEL */}
        <BookingSummary bookingData={bookingData} />
      </section>
    </main>
  );
}
