import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";

// Format VND
const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

function QtyControl({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40"
        disabled={disabled || value === 0}
      >
        –
      </button>
      <div className="w-8 h-8 rounded bg-gray-100 grid place-items-center text-gray-800">
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40"
        disabled={disabled}
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
  const [tourInfo, setTourInfo] = useState(null);

  useEffect(() => {
    if (!bookingData.tourId) return;
    const fetchTour = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${bookingData.tourId}`);
        if (!res.ok) throw new Error("Failed to fetch tour");
        const data = await res.json();
        setTourInfo(data);
        setBookingData((prev) => ({
          ...prev,
          tourInfo: data,
          tourName: data.title,
          date: data.startDate || prev.date,
        }));
      } catch (err) {
        console.error("❌ Error fetching tour:", err);
      }
    };
    fetchTour();
  }, [bookingData.tourId, setBookingData]);

  const handleDateChange = (d) => {
    setLocalDate(d);
    setBookingData({
      ...bookingData,
      date: d ? d.toISOString().split("T")[0] : "",
    });
  };

  const setTime = (v) => setBookingData({ ...bookingData, time: v.value });
  const setQty = (name, v) =>
    setBookingData({
      ...bookingData,
      tickets: { ...bookingData.tickets, [name]: v },
    });

  const { time, tickets = {} } = bookingData;
  const { adult = 0, child = 0 } = tickets;
  const priceAdult = tourInfo?.priceAdult ?? 0;
  const priceChild = tourInfo?.priceChild ?? 0;

  const lineItems = [
    { label: "Adult", key: "adult", qty: adult, price: priceAdult },
    { label: "Child", key: "child", qty: child, price: priceChild },
  ];

  const total = lineItems.reduce((s, it) => s + it.qty * it.price, 0);
  if (bookingData.total !== total) setBookingData({ ...bookingData, total });

  const timeOptions = ["09:00", "11:00", "13:00", "15:00", "17:00"].map((t) => ({
    value: t,
    label: t,
  }));

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-600 mb-2">Select a Date</label>
        <div className="relative flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-orange-400">
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

      <div>
        <label className="block text-sm text-gray-600 mb-2">Select a Time</label>
        <div className="relative flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-orange-400">
          <FaClock className="text-gray-500 mr-2" />
          <Select
            options={timeOptions}
            value={timeOptions.find((t) => t.value === time) || null}
            onChange={setTime}
            className="flex-1 text-sm"
            styles={{
              control: (base) => ({
                ...base,
                border: "none",
                boxShadow: "none",
              }),
              dropdownIndicator: (base) => ({
                ...base,
                color: "#fb923c",
              }),
            }}
          />
        </div>
      </div>

      <div className="space-y-4 mt-4">
        {lineItems.map((it) => (
          <div
            key={it.key}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-gray-800">{it.label}</div>
              <div className="text-orange-500 text-sm font-semibold">
                {formatVND(it.price)}
              </div>
            </div>
            <QtyControl
              value={it.qty}
              onChange={(v) => setQty(it.key, v)}
              disabled={false}
            />
          </div>
        ))}
      </div>

      <button
        onClick={nextStep}
        className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium mt-4"
      >
        Continue
      </button>
    </div>
  );
}
