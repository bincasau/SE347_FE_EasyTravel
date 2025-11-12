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
    tickets: {},
    total: 0,
    tourInfo: null,
    user: {
      name: "",
      surname: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!tourId) return;
    const fetchTour = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${tourId}`);
        if (!res.ok) throw new Error("Failed to fetch tour");
        const data = await res.json();
        setTour(data);
        setBookingData((prev) => ({
          ...prev,
          tourInfo: data,
          tourName: data.title,
          date: data.startDate || "",
        }));
      } catch (err) {
        console.error("❌ Error fetching tour:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [tourId]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  if (loading)
    return <div className="text-center mt-20 text-gray-500">Đang tải...</div>;
  if (!tour)
    return <div className="text-center mt-20 text-red-500">Không tìm thấy tour.</div>;

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-semibold text-gray-800 mb-8">
        Đặt tour: {tour.title}
      </h1>

      {/* Layout 2 cột cố định */}
      <section className="grid md:grid-cols-4 gap-8">
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

        {/* Summary luôn cố định */}
        <BookingSummary bookingData={bookingData} />
      </section>
    </main>
  );
}
