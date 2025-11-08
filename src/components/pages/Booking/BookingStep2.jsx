import React from "react";
import imgTour from "../../../assets/images/Tour/Booking.jpg";

export default function BookingStep2({
  bookingData,
  setBookingData,
  nextStep,
  prevStep,
}) {
  const { name, surname, phone, email } = bookingData.user;

  const handleChange = (field, value) => {
    setBookingData({
      ...bookingData,
      user: { ...bookingData.user, [field]: value },
    });
  };

  const isRoomBooking = !!bookingData.room?.type;

  return (
    <section className="grid md:grid-cols-5 gap-8">
      {/* LEFT FORM */}
      <div className="md:col-span-3 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {isRoomBooking
            ? "Thông tin người đặt phòng"
            : "Who shall we send these tickets to?"}
        </h2>

        <div className="grid grid-cols-2 gap-5">
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter your name"
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-400 focus:outline-none shadow-sm"
            />
          </div>

          {/* Surname */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Surname</label>
            <input
              value={surname}
              onChange={(e) => handleChange("surname", e.target.value)}
              placeholder="Enter your surname"
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-400 focus:outline-none shadow-sm"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Telephone</label>
            <input
              value={phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Enter your telephone number"
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-400 focus:outline-none shadow-sm"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Email Address</label>
            <input
              value={email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter your email address"
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-400 focus:outline-none shadow-sm"
            />
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
            {isRoomBooking ? "Booking Summary" : "Your Tickets Overview"}
          </h3>

          <div className="flex gap-3 mb-4">
            <img
              src={
                isRoomBooking
                  ? `/images/room/${
                      bookingData.room.image_bed || "standard.jpg"
                    }`
                  : imgTour
              }
              alt={isRoomBooking ? bookingData.room.type : "tour"}
              className="w-20 h-16 rounded-md object-cover"
            />
            <div>
              <div className="font-medium text-gray-800">
                {isRoomBooking
                  ? `${bookingData.room.type} (${bookingData.room.guests} khách)`
                  : "Wine tasting In Tuscany"}
              </div>
              <div className="text-xs text-gray-500">📅 {bookingData.date}</div>
              {!isRoomBooking && (
                <div className="text-xs text-gray-500">
                  🕒 {bookingData.time}
                </div>
              )}
            </div>
          </div>

          <hr className="my-3" />

          {/* Chi tiết */}
          <div className="text-sm space-y-2 text-gray-700">
            {isRoomBooking ? (
              <div className="flex justify-between capitalize">
                <span>1 phòng {bookingData.room.type}</span>
                <span>
                  {bookingData.room.price.toLocaleString("vi-VN")}₫ / đêm
                </span>
              </div>
            ) : (
              Object.entries(bookingData.tickets || {}).map(([key, qty]) => (
                <div key={key} className="flex justify-between capitalize">
                  <span>
                    {qty} {key}
                  </span>
                </div>
              ))
            )}
          </div>

          <hr className="my-4" />

          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-700">Total Price</span>
            <span className="text-orange-500 font-bold">
              {isRoomBooking
                ? `${bookingData.total.toLocaleString("vi-VN")}₫`
                : `€${bookingData.total}.00`}
            </span>
          </div>

          {/* Nút next */}
          <button
            onClick={nextStep}
            className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium mt-2"
          >
            Go to the Next Step
          </button>
        </div>
      </aside>
    </section>
  );
}
