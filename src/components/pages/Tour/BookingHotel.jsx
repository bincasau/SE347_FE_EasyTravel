import React from "react";
import bookingImg from "../../../assets/images/Tour/Booking.jpg"; // ảnh nền của bạn

export default function BookingHotel() {
  return (
    <section
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-[100vh] mt-20 bg-cover bg-center flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${bookingImg})`,
      }}
    >
      {/* Lớp phủ tối nhẹ để làm nổi form */}
      <div className="absolute inset-0 bg-black/30" />

      {/* FORM */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-[70%] sm:w-[60%] max-w-3xl text-gray-800 flex flex-col items-center border border-white/20">
        <h2 className="text-3xl font-bold text-white text-center mb-8 drop-shadow">
          Book Now Hotel
        </h2>

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {/* Full name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="mt-1 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              className="mt-1 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white">Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="mt-1 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Hotel Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white">Hotel Name</label>
            <input
              type="text"
              placeholder="Enter hotel name"
              className="mt-1 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white">Select Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Time */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white">Select Time</label>
            <input
              type="time"
              className="mt-1 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-10 py-2.5 rounded-full transition shadow-md"
            >
              Book Now
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
