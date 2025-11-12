import React from "react";

export default function BookingStepTour2({
  bookingData,
  setBookingData,
  nextStep,
  prevStep,
}) {
  const { user = {} } = bookingData;

  const handleChange = (field, value) => {
    setBookingData((prev) => ({
      ...prev,
      user: { ...prev.user, [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-podcast text-gray-800 mb-4">
        Contact Information
      </h2>

      <div className="space-y-4">
        <InputField
          label="First Name"
          value={user.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <InputField
          label="Last Name"
          value={user.surname}
          onChange={(e) => handleChange("surname", e.target.value)}
        />
        <InputField
          label="Phone Number"
          type="tel"
          value={user.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <InputField
          label="Email Address"
          type="email"
          value={user.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={prevStep}
          className="px-6 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full border rounded-lg px-4 py-2 text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </div>
  );
}
