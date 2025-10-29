import React, { useState } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import imgMain from "../../../assets/images/Tour/Booking.jpg";

// format €
const formatEUR = (n) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    n
  );

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

export default function BookingStep1({ bookingData, setBookingData, nextStep }) {
  const PRICES = { adult: 34, child: 22, infant: 0 };

  // giữ date là kiểu Date thật
  const [localDate, setLocalDate] = useState(
    bookingData.date ? new Date(bookingData.date) : null
  );

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

  const { date, time, tickets } = bookingData;
  const { adult, child, infant } = tickets;

  const lineItems = [
    { label: "Adult (18+)", key: "adult", qty: adult, price: PRICES.adult },
    { label: "Child (6–17)", key: "child", qty: child, price: PRICES.child },
    { label: "Infant (0–5)", key: "infant", qty: infant, price: PRICES.infant },
  ];

  const total = lineItems.reduce((s, it) => s + it.qty * it.price, 0);
  if (bookingData.total !== total) setBookingData({ ...bookingData, total });

  const timeOptions = ["09:00", "11:00", "13:00", "15:00", "17:00"].map(
    (t) => ({
      value: t,
      label: t,
    })
  );

  return (
    <section className="grid md:grid-cols-5 gap-8">
      {/* LEFT FORM */}
      <div className="md:col-span-3 space-y-6">
        {/* date */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            When will you visit?
          </label>
          <div className="relative flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-orange-400">
            <FaCalendarAlt className="text-gray-500 mr-2" />
            <DatePicker
              selected={localDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              placeholderText="Select a date"
              showPopperArrow={false}
              className="w-full text-sm text-gray-800 focus:outline-none"
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="flex justify-between items-center px-2 py-1 text-gray-700 text-sm">
                  <button
                    type="button"
                    onClick={() => decreaseMonth()}
                    disabled={prevMonthButtonDisabled}
                    className="px-2 py-1 hover:text-orange-500 disabled:text-gray-300"
                  >
                    ‹
                  </button>
                  <span className="font-medium">
                    {date.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => increaseMonth()}
                    disabled={nextMonthButtonDisabled}
                    className="px-2 py-1 hover:text-orange-500 disabled:text-gray-300"
                  >
                    ›
                  </button>
                </div>
              )}
            />
          </div>
        </div>

        {/* time */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Which time?
          </label>
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

        {/* notes */}
        <div className="bg-gray-50 rounded-lg border text-sm text-gray-600 p-4 space-y-2">
          <div>• Free for kids under 6 and disabled visitors (74%+)</div>
          <div>
            • Pregnant women, strollers, or visitors on crutches can buy priority tickets at the venue
          </div>
        </div>

        {/* tickets */}
        <div className="space-y-4">
          {lineItems.map((it) => (
            <div
              key={it.key}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-800">{it.label}</div>
                {it.key !== "infant" ? (
                  <div className="text-orange-500 text-sm font-semibold">
                    {formatEUR(it.price)}
                  </div>
                ) : (
                  <div className="text-orange-500 text-sm font-semibold">
                    FREE
                  </div>
                )}
              </div>
              <QtyControl
                value={it.qty}
                onChange={(v) => setQty(it.key, v)}
                disabled={it.key !== "adult" && adult === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SUMMARY */}
      <aside className="md:col-span-2">
        <div className="rounded-2xl border bg-white shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Your Tickets Overview
          </h3>

          <div className="flex gap-3 mb-4">
            <img
              src={imgMain}
              alt="tour"
              className="w-20 h-16 rounded-md object-cover"
            />
            <div>
              <div className="font-medium text-gray-800">
                Wine tasting In Tuscany
              </div>
              <div className="text-xs text-gray-500">📅 {date || "--"}</div>
              <div className="text-xs text-gray-500">🕒 {time || "--"}</div>
            </div>
          </div>

          <hr className="my-3" />

          <div className="space-y-2 text-sm">
            {lineItems.map((it) => (
              <div key={it.key} className="flex justify-between text-gray-700">
                <span>
                  {it.qty} {it.label}{" "}
                  {it.price > 0 && <span>({formatEUR(it.price)})</span>}
                </span>
                <span className="text-gray-800 font-medium">
                  {formatEUR(it.qty * it.price)}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-semibold">Total Price</span>
            <span className="text-orange-500 font-bold">
              {formatEUR(total)}
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
  );
}
