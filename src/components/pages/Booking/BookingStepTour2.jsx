import React, { useState, useEffect } from "react";

export default function BookingStepTour2({ bookingData, setBookingData, nextStep, prevStep }) {

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // 🔥 Lấy token đúng cách từ localStorage (KHÔNG HARD CODE)
  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  // 🔥 Fetch user info with JWT
  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("⚠ No JWT token found!");
      return; // Không crash
    }

    fetch("http://localhost:8080/account/detail", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUserInfo({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      })
      .catch((err) => console.error("❌ Error fetching user:", err));
  }, []);

  const handleChange = (field, value) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContinue = () => {
    if (!userInfo.name.trim())
      return alert("Please enter your full name.");

    if (!userInfo.phone.trim() || userInfo.phone.length < 8)
      return alert("Invalid phone number.");

    if (!userInfo.email.includes("@"))
      return alert("Invalid email address.");

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

      {/* NAME */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Full Name</label>
        <input
          type="text"
          value={userInfo.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-gray-700"
        />
      </div>

      {/* PHONE */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Phone</label>
        <input
          type="tel"
          value={userInfo.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-gray-700"
        />
      </div>

      {/* EMAIL */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={userInfo.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-gray-700"
        />
      </div>

      {/* ADDRESS */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Address</label>
        <input
          type="text"
          value={userInfo.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-gray-700"
        />
      </div>

      {/* BUTTONS */}
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
