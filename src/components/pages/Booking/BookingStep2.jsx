import React, { useEffect, useState } from "react";
import { getAccountDetail } from "@/apis/AccountAPI";

export default function BookingStep2({
  bookingData,
  setBookingData,
  nextStep,
  prevStep,
}) {
  const { name, surname, phone, email } = bookingData.user;
  const isRoomBooking = !!bookingData.room?.type;

  const [isLocked, setIsLocked] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  /* =======================
     HELPERS
  ======================= */
  function splitFullName(fullName = "") {
    if (!fullName || typeof fullName !== "string") {
      return { name: "", surname: "" };
    }

    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { name: parts[0], surname: "" };

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

  /* =======================
     CHECK LOGIN (INIT)
  ======================= */
  useEffect(() => {
    const init = async () => {
      const user = await loadLoggedInUser();

      if (!user) {
        //  LƯU URL HIỆN TẠI TRƯỚC KHI LOGIN
        sessionStorage.setItem(
          "redirectAfterLogin",
          window.location.pathname + window.location.search
        );

        setShowLoginPopup(true);
        return;
      }

      setBookingData((prev) => ({ ...prev, user }));
      setIsLocked(true);
    };

    init();
  }, []);

  /* =======================
     LISTEN LOGIN SUCCESS
  ======================= */
  useEffect(() => {
    const onJwtChanged = async () => {
      const user = await loadLoggedInUser();
      if (!user) return;

      setBookingData((prev) => ({ ...prev, user }));
      setIsLocked(true);
      setShowLoginPopup(false);

      // ⭐ QUAY LẠI TRANG CŨ (OVERRIDE navigate("/"))
      const redirect = sessionStorage.getItem("redirectAfterLogin");
      if (redirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
      }
    };

    window.addEventListener("jwt-changed", onJwtChanged);
    return () => window.removeEventListener("jwt-changed", onJwtChanged);
  }, []);

  /* =======================
     INPUT CHANGE
  ======================= */
  const handleChange = (field, value) => {
    if (isLocked) return;
    setBookingData({
      ...bookingData,
      user: { ...bookingData.user, [field]: value },
    });
  };

  /* =======================
     JSX
  ======================= */
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
            <InputField
              label="Name"
              value={name}
              disabled={isLocked}
              onChange={(v) => handleChange("name", v)}
            />
            <InputField
              label="Surname"
              value={surname}
              disabled={isLocked}
              onChange={(v) => handleChange("surname", v)}
            />
            <InputField
              label="Telephone"
              value={phone}
              disabled={isLocked}
              onChange={(v) => handleChange("phone", v)}
            />
            <InputField
              label="Email Address"
              value={email}
              disabled={isLocked}
              onChange={(v) => handleChange("email", v)}
            />
          </div>

          <button
            onClick={prevStep}
            className="rounded-full border px-6 py-2 text-gray-600 hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        {/* RIGHT */}
        <aside className="md:col-span-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold mb-4">
              {isRoomBooking ? "Booking Summary" : "Your Tickets Overview"}
            </h3>

            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total Price</span>
              <span className="text-orange-500 font-bold">
                {isRoomBooking
                  ? bookingData.total.toLocaleString("vi-VN") + "₫"
                  : `€${bookingData.total}.00`}
              </span>
            </div>

            <button
              onClick={nextStep}
              className="w-full bg-orange-500 text-white rounded-full py-3 font-medium hover:bg-orange-600"
            >
              Go to the Next Step
            </button>
          </div>
        </aside>
      </section>

      {/*  LOGIN POPUP */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Bạn cần đăng nhập</h2>
            <p className="text-gray-600 mb-4">
              Vui lòng đăng nhập để tiếp tục đặt phòng
            </p>
            <button
              onClick={() => window.dispatchEvent(new Event("open-login"))}
              className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* =======================
   INPUT FIELD
======================= */
function InputField({ label, value, disabled, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm mb-1 text-gray-600">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`border rounded-lg px-3 py-2 text-sm
          ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "focus:ring-2 focus:ring-orange-400"
          }`}
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
  );
}
