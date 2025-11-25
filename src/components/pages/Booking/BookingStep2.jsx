import React, { useEffect, useState } from "react";
import { getAccountDetail } from "@/apis/AccountAPI";

export default function BookingStep2({
  bookingData,
  setBookingData,
  nextStep,
  prevStep,
  onOpenLogin,
}) {
  const { name, surname, phone, email } = bookingData.user;
  const isRoomBooking = !!bookingData.room?.type;

  const [isLocked, setIsLocked] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false); // 👉 popup login

  function splitFullName(fullName = "") {
    if (!fullName || typeof fullName !== "string") {
      return { name: "", surname: "" };
    }

    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
      return { name: parts[0], surname: "" };
    }
    z;

    return {
      surname: parts.slice(0, -1).join(" "),
      name: parts[parts.length - 1],
    };
  }

  async function loadLoggedInUser() {
    try {
      const user = await getAccountDetail();
      const { name, surname } = splitFullName(user.name || "");

      return {
        name,
        surname,
        phone: user.phone || "",
        email: user.email || "",
      };
    } catch {
      return null;
    }
  }

  /** ===========================================
   *  CHECK LOGIN + LOAD USER
   * =========================================== */
  useEffect(() => {
    const init = async () => {
      const user = await loadLoggedInUser();

      // ❌ Không redirect — chỉ popup yêu cầu đăng nhập
      if (!user) {
        setShowLoginPopup(true);
        return;
      }

      // ✔ Đã login
      setBookingData((prev) => ({
        ...prev,
        user,
      }));
      setIsLocked(true);
    };

    init();
  }, []);

  useEffect(() => {
    const fn = async () => {
      const user = await loadLoggedInUser();
      if (user) {
        setBookingData((prev) => ({ ...prev, user }));
        setIsLocked(true);
        setShowLoginPopup(false); //  Ẩn popup
      }
    };

    window.addEventListener("jwt-changed", fn);

    return () => window.removeEventListener("jwt-changed", fn);
  }, []);
  /** ===========================================
   *  CHANGE HANDLER
   * =========================================== */
  const handleChange = (field, value) => {
    if (isLocked) return; // prevent edit
    setBookingData({
      ...bookingData,
      user: { ...bookingData.user, [field]: value },
    });
  };

  /** ===========================================
   *  JSX
   * =========================================== */
  return (
    <>
      <section className="grid md:grid-cols-5 gap-8">
        {/* LEFT */}
        <div className="md:col-span-3 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {isRoomBooking
              ? "Thông tin người đặt phòng"
              : "Thông tin người nhận vé"}
          </h2>

          <div className="grid grid-cols-2 gap-5">
            {/* Name */}
            <InputField
              label="Name"
              value={name}
              disabled={isLocked}
              onChange={(v) => handleChange("name", v)}
            />

            {/* Surname */}
            <InputField
              label="Surname"
              value={surname}
              disabled={isLocked}
              onChange={(v) => handleChange("surname", v)}
            />

            {/* Phone */}
            <InputField
              label="Telephone"
              value={phone}
              disabled={isLocked}
              onChange={(v) => handleChange("phone", v)}
            />

            {/* Email */}
            <InputField
              label="Email Address"
              value={email}
              disabled={isLocked}
              onChange={(v) => handleChange("email", v)}
            />
          </div>

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
                    : bookingData.tourName}
                </div>

                <div className="text-xs text-gray-500">
                  📅 {bookingData.date}
                </div>

                {!isRoomBooking && (
                  <div className="text-xs text-gray-500">
                    🕒 {bookingData.time}
                  </div>
                )}
              </div>
            </div>

            <hr className="my-3" />

            {/* SUMMARY */}
            <div className="text-sm space-y-2 text-gray-700">
              {isRoomBooking ? (
                <div className="flex justify-between">
                  <span>1 phòng {bookingData.room.type}</span>
                  <span>
                    {bookingData.room.price.toLocaleString("vi-VN")}₫ / đêm
                  </span>
                </div>
              ) : (
                Object.entries(bookingData.tickets).map(([k, qty]) => (
                  <div key={k} className="flex justify-between">
                    <span>
                      {qty} {k}
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
                  ? bookingData.total.toLocaleString("vi-VN") + "₫"
                  : `€${bookingData.total}.00`}
              </span>
            </div>

            <button
              onClick={nextStep}
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium mt-2"
            >
              Go to the Next Step
            </button>
          </div>
        </aside>
      </section>

      {/* ================== 🔥 POPUP LOGIN ================== */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <div className="text-red-500 text-4xl mb-3">⚠️</div>

            <h2 className="text-xl font-semibold mb-2">Bạn cần đăng nhập</h2>

            <p className="text-gray-600 mb-4">
              Vui lòng đăng nhập để tiếp tục đặt phòng.
            </p>

            <button
              onClick={() => window.dispatchEvent(new Event("open-login"))}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* -----------------------
   INPUT FIELD Component
----------------------- */
function InputField({ label, value, disabled, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:outline-none shadow-sm 
          ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "focus:ring-orange-400"
          }`}
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
  );
}
