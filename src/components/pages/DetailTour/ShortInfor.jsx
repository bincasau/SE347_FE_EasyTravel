import React, { useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { useNavigate } from "react-router-dom";

import imgMain from "../../../assets/images/Tour/travel1.jpg";
import img2 from "../../../assets/images/Tour/travel2.jpg";
import img3 from "../../../assets/images/Tour/travel3.jpg";
import img4 from "../../../assets/images/Tour/travel4.jpg";

export default function TourDetail() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- Calendar UI ---
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="px-2 py-1 rounded hover:bg-gray-100"
      >
        &lt;
      </button>
      <span className="font-semibold text-gray-800">
        {format(currentMonth, "MMMM yyyy")}
      </span>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="px-2 py-1 rounded hover:bg-gray-100"
      >
        &gt;
      </button>
    </div>
  );

  const renderDays = () => {
    const dateNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-1">
        {dateNames.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-gray-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formatted = format(day, "d");
        days.push(
          <div
            key={day}
            onClick={() => setSelectedDate(cloneDay)}
            className={`text-xs sm:text-sm text-center py-2 rounded-md cursor-pointer transition-all duration-100 ${
              !isSameMonth(day, monthStart)
                ? "text-gray-300"
                : isSameDay(day, selectedDate)
                ? "bg-orange-500 text-white shadow-md"
                : "hover:bg-orange-100 text-gray-700"
            }`}
          >
            {formatted}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-[2px]" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  // --- Handle navigation to Booking page ---
  const handleBuyNow = () => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

    // ✅ Điều hướng sang trang thanh toán và truyền dữ liệu tour
    navigate("/booking", {
      state: {
        tour: {
          name: "Wine tasting In Tuscany",
          price: 34,
          date: selectedDateStr,
          image: imgMain,
        },
      },
    });
  };

  // --- UI Layout ---
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-10 items-end">
      {/* Left section - Images */}
      <div className="flex flex-col relative">
        {/* Back button */}
        <button
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate("/tours");
          }}
          className="absolute -top-10 left-0 flex items-center gap-1 text-gray-600 text-[17px] font-medium hover:text-orange-600 transition"
        >
          ← Back
        </button>

        <img
          src={imgMain}
          alt="Wine Tasting in Tuscany"
          className="rounded-2xl w-full h-[540px] object-cover shadow-md hover:scale-[1.01] transition"
        />

        <div className="flex gap-4 mt-4">
          {[img2, img3, img4].map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-1/3 h-32 rounded-xl object-cover hover:scale-105 transition"
            />
          ))}
        </div>
      </div>

      {/* Right section - Tour Details */}
      <div className="flex flex-col justify-between h-full pb-4">
        <div className="mt-[60px]">
          <h1 className="text-4xl font-podcast font-light mb-1 text-gray-800 leading-snug">
            Wine tasting In Tuscany
          </h1>

          <p className="text-lg text-gray-600 mb-3">
            from{" "}
            <span className="text-3xl text-orange-500 font-bold">34 €</span>
          </p>

          <p className="text-gray-500 mb-5 leading-relaxed text-justify">
            Enjoy a half-day experience in the heart of Tuscany. Visit authentic
            wineries, learn about the production of world-famous Chianti wines,
            and taste the finest local selections.
          </p>

          <p className="font-medium mb-2 text-gray-700">Select a date</p>

          <div className="border rounded-2xl p-3 inline-block shadow-md w-[280px] sm:w-[300px] bg-white">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </div>
        </div>

        {/* ✅ Buy Now button */}
        <button
          onClick={handleBuyNow}
          className="bg-orange-500 hover:bg-orange-600 text-white w-44 self-center md:self-start rounded-full px-6 py-3 shadow-md transition-all mt-6"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
