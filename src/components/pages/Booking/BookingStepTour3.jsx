import React from "react";

export default function BookingStepTour3({ bookingData, prevStep }) {
  const { tourInfo, user, tickets = {} } = bookingData;
  const { title, destination, startDate } = tourInfo || {};
  const { adult = 0, child = 0 } = tickets;

  const handleConfirm = () => {
    alert("✅ Booking confirmed! (Demo)");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-podcast text-gray-800 mb-4">
        Payment Confirmation
      </h2>

      <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-3">
        <p className="text-gray-700">
          <strong>Tour:</strong> {title}
        </p>
        <p className="text-gray-700">
          <strong>Destination:</strong> {destination}
        </p>
        <p className="text-gray-700">
          <strong>Departure Date:</strong> {startDate}
        </p>
        <p className="text-gray-700">
          <strong>Tickets:</strong> {adult} adult{adult > 1 ? "s" : ""}
          {child > 0 ? `, ${child} child${child > 1 ? "ren" : ""}` : ""}
        </p>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-3">
        <h3 className="font-semibold text-gray-800">Your Information</h3>
        <p className="text-gray-700">
          <strong>Name:</strong> {user.name} {user.surname}
        </p>
        <p className="text-gray-700">
          <strong>Phone:</strong> {user.phone}
        </p>
        <p className="text-gray-700">
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={prevStep}
          className="px-6 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all"
        >
          ← Back
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
