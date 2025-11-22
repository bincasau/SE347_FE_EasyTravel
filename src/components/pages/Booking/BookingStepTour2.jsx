import React, { useState, useEffect } from "react";

export default function BookingStepTour2({
  bookingData,
  setBookingData,
  nextStep,
  prevStep,
}) {
  const [userInfo, setUserInfo] = useState({
    name: bookingData.user.name || "",
    surname: bookingData.user.surname || "",
    phone: bookingData.user.phone || "",
    email: bookingData.user.email || "",
  });

  const handleChange = (field, value) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContinue = () => {
    if (!userInfo.name.trim()) return alert("Please enter your first name.");
    if (!userInfo.surname.trim()) return alert("Please enter your last name.");
    if (!userInfo.phone.trim() || userInfo.phone.length < 8)
      return alert("Invalid phone number.");
    if (!userInfo.email.includes("@")) return alert("Invalid email.");

    setBookingData((prev) => ({
      ...prev,
      user: { ...userInfo },
    }));

    nextStep();
  };

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-semibold text-gray-800">
        Traveler Information
      </h2>

      <div>
        <label className="block text-sm text-gray-600 mb-1">First Name</label>
        <input
          type="text"
          value={userInfo.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Last Name</label>
        <input
          type="text"
          value={userInfo.surname}
          onChange={(e) => handleChange("surname", e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Phone</label>
        <input
          type="tel"
          value={userInfo.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={userInfo.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-gray-700"
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Back
        </button>

        <button
          onClick={handleContinue}
          className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
