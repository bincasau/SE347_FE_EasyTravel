import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { useNavigate } from "react-router-dom";

import imgMain from "../../../assets/images/Tour/travel2.jpg";
import img2 from "../../../assets/images/Tour/travel3.jpg";
import img3 from "../../../assets/images/Tour/travel4.jpg";
import img4 from "../../../assets/images/Tour/travel5.jpg";

export default function TourDetail() {
  const navigate = useNavigate();

  // 🔸 Giả lập dữ liệu (sau này fetch từ API)
  const tour = {
    title: "Wine Tasting in Tuscany",
    description:
      "Taste authentic Tuscan wines and enjoy local cuisine surrounded by vineyards and scenic landscapes.",
    price: 45,
    start_date: "2025-03-02",
    end_date: "2025-03-05",
    image: imgMain,
  };

  const startDate = parseISO(tour.start_date);
  const endDate = parseISO(tour.end_date);
  const currentMonth = startDate;

  // --- Calendar header ---
  const renderHeader = () => (
    <div className="flex justify-center items-center mb-1 text-sm text-gray-700 font-semibold">
      {format(currentMonth, "MMMM yyyy")}
    </div>
  );

  // --- Tên ngày ---
  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-1">
        {days.map((d) => (
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

  // --- Lịch với dải cam ngang ---
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startWeek = startOfWeek(monthStart);
    const endWeek = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startWeek;

    while (day <= endWeek) {
      for (let i = 0; i < 7; i++) {
        const formatted = format(day, "d");
        const isOtherMonth = !isSameMonth(day, monthStart);
        const isStart = isSameDay(day, startDate);
        const isEnd = isSameDay(day, endDate);
        const isInRange =
          isWithinInterval(day, { start: startDate, end: endDate }) &&
          !isStart &&
          !isEnd;

        let cellClass =
          "relative text-xs sm:text-sm text-center py-[10px] transition-all duration-100 select-none flex items-center justify-center ";

        if (isOtherMonth) {
          cellClass += "text-gray-300";
        } else if (isStart || isEnd) {
          cellClass +=
            "bg-orange-500 text-white font-semibold shadow-md z-10 rounded-md"; // 👈 bo góc nhẹ
        } else if (isInRange) {
          cellClass += "bg-orange-100 text-gray-700";
        } else {
          cellClass += "text-gray-400";
        }

        days.push(
          <div key={day} className="relative">
            {isInRange && (
              <div className="absolute inset-0 bg-orange-200 z-0"></div>
            )}
            <div className={cellClass}>{formatted}</div>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-[0px] mb-[1px]" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  // --- Nút mua ---
  const handleBuyNow = () => {
    navigate("/booking", {
      state: {
        tour: {
          name: tour.title,
          price: tour.price,
          date: tour.start_date,
          image: tour.image,
        },
      },
    });
  };

  // --- Giao diện ---
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-10 items-end">
      {/* Left - Hình ảnh */}
      <div className="flex flex-col relative">
        {/* Nút Back bo góc nhẹ */}
        <button
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate("/tours");
          }}
          className="absolute -top-10 mb-10 left-0 flex items-center gap-2 
            border border-orange-500 text-orange-500 
            bg-white text-[15px] font-medium 
            px-4 py-1.5 rounded-md
            hover:bg-orange-500 hover:text-white 
            transition-all duration-200 shadow-sm"
        >
          ← Back
        </button>

        <img
          src={tour.image}
          alt={tour.title}
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

      {/* Right - Chi tiết tour */}
      <div className="flex flex-col justify-between h-full pb-4">
        <div className="mt-[60px]">
          <h1 className="text-4xl font-podcast font-light mb-1 text-gray-800 leading-snug">
            {tour.title}
          </h1>

          <p className="text-lg text-gray-600 mb-3">
            from{" "}
            <span className="text-3xl text-orange-500 font-bold">
              {tour.price} €
            </span>
          </p>

          <p className="text-gray-500 mb-5 leading-relaxed text-justify">
            {tour.description}
          </p>

          <p className="font-medium mb-2 text-gray-700">Trip Duration</p>

          <div className="border rounded-2xl p-3 inline-block shadow-md w-[280px] sm:w-[300px] bg-white">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </div>
        </div>

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
