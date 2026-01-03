import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";

// Format VND
const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

/**
 * QtyControl:
 *  - Nút "-" chỉ disable khi value = 0
 *  - Nút "+" disable theo props disablePlus (dùng khi đã đủ ghế)
 */
function QtyControl({ value, onChange, disablePlus }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40"
        disabled={value === 0}
      >
        –
      </button>
      <div className="w-8 h-8 rounded bg-gray-100 grid place-items-center text-gray-800">
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40"
        disabled={disablePlus}
      >
        +
      </button>
    </div>
  );
}

export default function BookingStepTour1({ bookingData, setBookingData, nextStep }) {
  const [localDate, setLocalDate] = useState(
    bookingData.date ? new Date(bookingData.date) : null
  );

  // 1️⃣ Dữ liệu tour + ghế
  const tour = bookingData.tourInfo;
  const availableSeats = bookingData.availableSeats ?? 0;

  if (!tour) {
    return <div className="text-gray-500">Loading tour info...</div>;
  }

  // 2️⃣ Giá gốc + giảm giá
  const basePriceAdult = tour.priceAdult ?? 0;
  const basePriceChild = tour.priceChild ?? 0;
  const discountPercent = tour.percentDiscount ?? 0;
  const discountFactor =
    discountPercent > 0 ? 1 - discountPercent / 100 : 1;

  const priceAdult = basePriceAdult * discountFactor;
  const priceChild = basePriceChild * discountFactor;

  const { tickets = {} } = bookingData;
  const { adult = 0, child = 0 } = tickets;

  // 3️⃣ Tính tổng + giới hạn ghế
  const totalSelected = adult + child;
  const maxReached = availableSeats > 0 && totalSelected >= availableSeats;

  const handleDateChange = (d) => {
    setLocalDate(d);
    setBookingData({
      ...bookingData,
      date: d ? d.toISOString().split("T")[0] : "",
    });
  };

  const setQty = (key, qty) => {
    // tính thử số lượng mới
    const newAdult = key === "adult" ? qty : adult;
    const newChild = key === "child" ? qty : child;

    if (availableSeats > 0 && newAdult + newChild > availableSeats) {
      // không alert, chỉ không update để UX mượt hơn
      return;
    }

    setBookingData({
      ...bookingData,
      tickets: {
        ...bookingData.tickets,
        [key]: qty,
      },
    });
  };

  // 4️⃣ Tính total (đã áp dụng giảm giá)
  const total = adult * priceAdult + child * priceChild;

  useEffect(() => {
    if (bookingData.total !== total) {
      setBookingData((prev) => ({ ...prev, total }));
    }
  }, [total]);

  const disableAdultPlus =
    availableSeats > 0 && adult + child >= availableSeats;
  const disableChildPlus =
    availableSeats > 0 && adult + child >= availableSeats;

  return (
    <div className="space-y-6">
      {/* 🗓 DATE */}
      <div>
        <label className="block text-sm text-gray-600 mb-2">Select a Date</label>
        <div className="relative flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
          <FaCalendarAlt className="text-gray-500 mr-2" />
          <DatePicker
            selected={localDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            placeholderText="Choose a travel date"
            showPopperArrow={false}
            className="w-full text-sm text-gray-800 focus:outline-none"
          />
        </div>
      </div>

      {/* 🎫 TICKET SELECTION */}
      <div className="space-y-4 mt-4">
        {/* Adult */}
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-800">Adult</div>
            <div className="text-sm text-gray-500 line-through">
              {discountPercent > 0 && formatVND(basePriceAdult)}
            </div>
            <div className="text-orange-500 text-sm font-semibold">
              {formatVND(priceAdult)}
              {discountPercent > 0 && (
                <span className="ml-2 text-xs text-green-600">
                  (-{discountPercent}%)
                </span>
              )}
            </div>
          </div>

          <QtyControl
            value={adult}
            onChange={(v) => setQty("adult", v)}
            disablePlus={disableAdultPlus}
          />
        </div>

        {/* Child */}
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-800">Child</div>
            <div className="text-sm text-gray-500 line-through">
              {discountPercent > 0 && formatVND(basePriceChild)}
            </div>
            <div className="text-orange-500 text-sm font-semibold">
              {formatVND(priceChild)}
              {discountPercent > 0 && (
                <span className="ml-2 text-xs text-green-600">
                  (-{discountPercent}%)
                </span>
              )}
            </div>
          </div>

          <QtyControl
            value={child}
            onChange={(v) => setQty("child", v)}
            disablePlus={disableChildPlus}
          />
        </div>

        <p className="text-sm text-gray-500">
          🎟 Số ghế còn lại: <b>{availableSeats}</b>
        </p>
      </div>

      {/* ➡️ CONTINUE */}
      <button
        onClick={() => {
          if (adult + child === 0) {
            alert("Bạn phải chọn ít nhất 1 vé.");
            return;
          }
          nextStep();
        }}
        className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium mt-4"
      >
        Continue
      </button>
    </div>
  );
}
