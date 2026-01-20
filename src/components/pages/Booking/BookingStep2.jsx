import React, { useEffect, useState } from "react";
import { getAccountDetail } from "@/apis/AccountAPI";

// AWS image
const AWS_ROOM_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";

// format VND
const formatVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")}₫`;

export default function BookingStep2({
  bookingData,
  setBookingData,
  nextStep,
  prevStep,
}) {
  const { room = {}, hotel = {}, user = {} } = bookingData;
  const { name, surname, phone, email } = user;

  const isRoomBooking = !!room?.type;

  const [locked, setLocked] = useState({
    name: false,
    surname: false,
    phone: false,
    email: false,
  });
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

  function buildLockedByUser(u) {
    const nm = (u?.name || "").trim();
    const sn = (u?.surname || "").trim();
    const ph = (u?.phone || "").trim();
    const em = (u?.email || "").trim();

    // ✅ có dữ liệu thì lock, thiếu thì cho sửa
    return {
      name: !!nm,
      surname: !!sn,
      phone: !!ph,
      email: !!em,
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
     CHECK LOGIN
  ======================= */
  useEffect(() => {
    const init = async () => {
      const user = await loadLoggedInUser();

      if (!user) {
        sessionStorage.setItem(
          "redirectAfterLogin",
          window.location.pathname + window.location.search,
        );
        setShowLoginPopup(true);
        return;
      }

      setBookingData((prev) => ({ ...prev, user }));
      setLocked(buildLockedByUser(user)); // ✅ thiếu field nào thì field đó mở
    };

    init();
  }, []);

  useEffect(() => {
    const onJwtChanged = async () => {
      const user = await loadLoggedInUser();
      if (!user) return;

      setBookingData((prev) => ({ ...prev, user }));
      setLocked(buildLockedByUser(user)); // ✅ thiếu field nào thì field đó mở
      setShowLoginPopup(false);

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
    if (locked[field]) return;
    setBookingData({
      ...bookingData,
      user: { ...bookingData.user, [field]: value },
    });
  };

  /* =======================
     SUMMARY DATA
  ======================= */
  const nights = bookingData.nights || 1;
  const lineItems = [
    {
      label: `${room.type} Room`,
      qty: nights,
      price: room.price || 0,
    },
  ];

  const total = lineItems.reduce((s, it) => s + it.qty * it.price, 0);

  /* =======================
     JSX
  ======================= */
  return (
    <>
      <section className="grid md:grid-cols-5 gap-8">
        {/* LEFT */}
        <div className="md:col-span-3 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Thông tin người đặt phòng
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <InputField
              label="Name"
              value={name}
              disabled={locked.name}
              onChange={(v) => handleChange("name", v)}
            />
            <InputField
              label="Surname"
              value={surname}
              disabled={locked.surname}
              onChange={(v) => handleChange("surname", v)}
            />
            <InputField
              label="Telephone"
              value={phone}
              disabled={locked.phone}
              onChange={(v) => handleChange("phone", v)}
            />
            <InputField
              label="Email Address"
              value={email}
              disabled={locked.email}
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

        {/* RIGHT – SUMMARY */}
        <aside className="md:col-span-2">
          <div className="rounded-2xl border bg-white shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Tóm tắt đặt phòng
            </h3>

            <div className="flex gap-3 mb-4">
              <img
                src={`${AWS_ROOM_IMAGE_BASE}/${room.image_bed}`}
                alt={room.type}
                className="w-20 h-16 rounded-md object-cover"
                onError={(e) => {
                  e.currentTarget.src = `${AWS_ROOM_IMAGE_BASE}/standard_bed.jpg`;
                }}
              />

              <div className="text-sm leading-snug">
                <div className="font-medium text-gray-800">
                  {hotel.name} – {room.type} ({room.guests} khách)
                </div>
                <div className="text-xs text-gray-500">{hotel.address}</div>
              </div>
            </div>

            <hr className="my-3" />

            <div className="text-sm space-y-2 text-gray-700">
              {lineItems.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {it.qty} đêm · {it.label}
                  </span>
                  <span className="font-medium">
                    {formatVND(it.qty * it.price)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-sm font-semibold mb-4">
              <span>Tổng tiền</span>
              <span className="text-orange-500">{formatVND(total)}</span>
            </div>

            <button
              onClick={nextStep}
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium"
            >
              Tiếp tục
            </button>
          </div>
        </aside>
      </section>

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
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
