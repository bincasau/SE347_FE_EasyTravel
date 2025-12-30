import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getRoomBookedDates } from "@/apis/booking";

// ===== AWS IMAGE BASE =====
const AWS_ROOM_IMAGE_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/room";

// format VND
const formatVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")}₫`;

export default function BookingStep1({
  bookingData,
  setBookingData,
  nextStep,
}) {
  const { room = {}, hotel = {} } = bookingData;

  const realHotelId = hotel.hotelId || hotel.id;
  const realRoomId = room.roomId || room.id;
  const imageBed = room.image_bed;
  
  // === STATE ===
  const [checkInLocal, setCheckInLocal] = useState(
    bookingData.checkInDate ? new Date(bookingData.checkInDate) : null
  );
  const [checkOutLocal, setCheckOutLocal] = useState(
    bookingData.checkOutDate ? new Date(bookingData.checkOutDate) : null
  );

  const [disabledDates, setDisabledDates] = useState([]);

  // === FETCH BLOCKED DATES ===
  useEffect(() => {
    if (!realHotelId || !realRoomId) return;

    getRoomBookedDates(realHotelId, realRoomId).then((dates) => {
      setDisabledDates(dates || []);
    });
  }, [realHotelId, realRoomId]);

  // Check if picking a range overlaps disabled dates
  const isRangeBlocked = (start, end) => {
    if (!start || !end) return false;
    return disabledDates.some((d) => d >= start && d <= end);
  };

  // === TÍNH SỐ ĐÊM ===
  let nights = 0;
  if (checkInLocal && checkOutLocal) {
    const diff = checkOutLocal - checkInLocal;
    nights = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  // === HANDLERS ===
  const handleCheckInChange = (d) => {
    setCheckInLocal(d);

    setBookingData((prev) => ({
      ...prev,
      checkInDate: d ? d.toISOString().split("T")[0] : "",
    }));

    if (checkOutLocal && isRangeBlocked(d, checkOutLocal)) {
      setCheckOutLocal(null);
      setBookingData((prev) => ({ ...prev, checkOutDate: "" }));
    }
  };

  const handleCheckOutChange = (d) => {
    if (!d) return;

    if (isRangeBlocked(checkInLocal, d)) {
      alert("Khoảng ngày bạn chọn nằm trong thời gian đã có người đặt.");
      return;
    }

    setCheckOutLocal(d);

    setBookingData((prev) => ({
      ...prev,
      checkOutDate: d.toISOString().split("T")[0],
    }));
  };

  const handleNext = () => {
    if (!checkInLocal || !checkOutLocal) {
      alert("❌ Vui lòng chọn ngày nhận phòng và ngày trả phòng!");
      return;
    }

    setBookingData((prev) => ({
      ...prev,
      nights,
      total: room.price * (nights || 1),
    }));

    nextStep();
  };

  // Highlight ngày blocked
  const dayClassName = (date) => {
    const isBlocked = disabledDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
    return isBlocked ? "blocked-day" : "";
  };

  // === SUMMARY ITEMS ===
  const lineItems = [
    {
      label: `${room.type} Room`,
      qty: nights || 1,
      price: room.price || 0,
    },
  ];

  const total = lineItems.reduce((s, it) => s + it.qty * it.price, 0);

  return (
    <section className="grid md:grid-cols-5 gap-8">
      {/* LEFT */}
      <div className="md:col-span-3 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Thông tin đặt phòng
        </h2>

        {/* HOTEL INFO */}
        <div className="border rounded-xl p-4 bg-gray-50">
          <div className="font-semibold text-gray-800">{hotel.name}</div>
          <div className="text-sm text-gray-600">📍 {hotel.address}</div>
        </div>

        {/* DATES */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Check-in */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Ngày nhận phòng
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <DatePicker
                selected={checkInLocal}
                onChange={handleCheckInChange}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                excludeDates={disabledDates}
                dayClassName={dayClassName}
                placeholderText="Chọn ngày nhận phòng"
                className="w-full text-sm"
              />
            </div>
          </div>

          {/* Check-out */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Ngày trả phòng
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <DatePicker
                selected={checkOutLocal}
                onChange={handleCheckOutChange}
                dateFormat="dd/MM/yyyy"
                minDate={checkInLocal || new Date()}
                excludeDates={disabledDates}
                dayClassName={dayClassName}
                placeholderText="Chọn ngày trả phòng"
                className="w-full text-sm"
                disabled={!checkInLocal}
              />
            </div>
          </div>
        </div>

        {/* Nights info */}
        {nights > 0 ? (
          <div className="p-3 bg-orange-100 border border-orange-300 text-orange-800 rounded-lg font-semibold">
            {room.type} · {room.guests} khách · {nights} đêm
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Vui lòng chọn ngày nhận và trả phòng.
          </p>
        )}
      </div>

      {/* RIGHT SUMMARY */}
      <aside className="md:col-span-2">
        <div className="rounded-2xl border bg-white shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Tóm tắt đặt phòng
          </h3>

          <div className="flex gap-3 mb-4">
            <img
              src={`${AWS_ROOM_IMAGE_BASE}/${imageBed}`}
              alt={room.type}
              className="w-20 h-16 rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.src = `${AWS_ROOM_IMAGE_BASE}/standard_bed.jpg`;
              }}
            />

            <div className="text-sm">
              <div className="font-medium text-gray-800">
                {hotel.name} – {room.type} ({room.guests} khách)
              </div>
              <div className="text-xs text-gray-500">📍 {hotel.address}</div>
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

          <div className="flex justify-between font-semibold mb-4">
            <span>Tổng tiền</span>
            <span className="text-orange-500">{formatVND(total)}</span>
          </div>

          <button
            onClick={handleNext}
            className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium"
          >
            Tiếp tục
          </button>
        </div>
      </aside>
    </section>
  );
}
