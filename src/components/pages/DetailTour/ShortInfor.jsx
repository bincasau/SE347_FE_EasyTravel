import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

import travel1 from "../../../assets/images/Tour/travel1.jpg";
import travel2 from "../../../assets/images/Tour/travel2.jpg";
import travel3 from "../../../assets/images/Tour/travel3.jpg";
import travel4 from "../../../assets/images/Tour/travel4.jpg";

// ✅ dùng chung với Header (project bạn đã có)
import { getUserFromToken } from "@/utils/auth";

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  const [loading, setLoading] = useState(true);

  const S3_TOUR_IMG_BASE =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

  const fallbackImages = useMemo(() => [travel1, travel2, travel3, travel4], []);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${id}`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu tour");
        const data = await res.json();
        setTour(data);

        const s3Images = Array.from({ length: 5 }, (_, idx) => {
          const n = idx + 1;
          return `${S3_TOUR_IMG_BASE}/tour_${id}_img_${n}.jpg`;
        });

        setImages(s3Images);
        setSelectedImg(s3Images[0]);
      } catch (err) {
        console.error("❌ Lỗi khi fetch tour:", err);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchTour();
  }, [id]);

  useEffect(() => {
    if (images?.length) setSelectedImg(images[0]);
  }, [images]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Đang tải dữ liệu tour...
      </div>
    );

  if (!tour)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Không tìm thấy tour.
      </div>
    );

  const {
    title,
    description,
    priceAdult,
    percentDiscount,
    startDate,
    endDate,
    destination,
  } = tour;

  const formatCurrency = (val) =>
    Number(val ?? 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const currentMonth = start;

  const renderHeader = () => (
    <div className="flex justify-center items-center mb-1 text-sm text-gray-700 font-semibold">
      {format(currentMonth, "MMMM yyyy")}
    </div>
  );

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
        const isStart = isSameDay(day, start);
        const isEnd = isSameDay(day, end);
        const isInRange =
          isWithinInterval(day, { start, end }) && !isStart && !isEnd;

        let cellClass =
          "relative text-xs sm:text-sm text-center py-[10px] transition-all duration-100 select-none flex items-center justify-center ";

        if (isOtherMonth) cellClass += "text-gray-300";
        else if (isStart || isEnd)
          cellClass +=
            "bg-orange-500 text-white font-semibold rounded-md shadow-md";
        else if (isInRange) cellClass += "bg-orange-100 text-gray-700";
        else cellClass += "text-gray-400";

        days.push(
          <div key={format(day, "yyyy-MM-dd")} className="relative">
            {isInRange && (
              <div className="absolute inset-0 bg-orange-200 z-0"></div>
            )}
            <div className={cellClass}>{formatted}</div>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div
          className="grid grid-cols-7 gap-[0px] mb-[1px]"
          key={format(day, "yyyy-MM-dd")}
        >
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  const mainImg = selectedImg || images[0] || fallbackImages[0];
  const previewImages =
    images.length >= 4 ? images.slice(1, 4) : fallbackImages.slice(1, 4);

  // ✅ helper: check login + role
  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const handleBuyNow = () => {
    const token = getToken();
    if (!token) {
      // chưa đăng nhập
      alert("Please log in to book this tour.");
      // optional: mở popup login nếu bạn đang dùng event
      window.dispatchEvent(new Event("open-login"));
      return;
    }

    const jwtUser = getUserFromToken(); // { role, ... } hoặc null
    const role = String(jwtUser?.role || "").toUpperCase();

    if (role === "TOUR_GUIDE") {
      alert("Please log in with a USER account to book this tour.");
      return;
    }

    // ✅ USER (hoặc role khác bạn muốn cho booking)
    navigate(`/booking/${id}`, {
      state: { tour, images },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-6 md:gap-8 items-start">
      {/* Left images */}
      <div className="flex flex-col relative">
        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/tours")
          }
          className="absolute -top-10 left-0 flex items-center gap-2 
            border border-orange-500 text-orange-500 
            bg-white text-[15px] font-medium 
            px-4 py-1.5 rounded-md
            hover:bg-orange-500 hover:text-white 
            transition-all duration-200 shadow-sm"
        >
          ← Back
        </button>

        <div className="w-full h-[620px] rounded-2xl overflow-hidden shadow-md bg-gray-100">
          <img
            src={mainImg}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.01]"
            onError={(e) => (e.currentTarget.src = fallbackImages[0])}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {previewImages.map((img, i) => {
            const isActive = img === mainImg;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImg(img)}
                className={[
                  "rounded-xl overflow-hidden bg-gray-100 shadow-sm",
                  "h-[140px] w-full",
                  "ring-2 ring-offset-2 transition",
                  isActive
                    ? "ring-orange-500"
                    : "ring-transparent hover:ring-orange-300",
                ].join(" ")}
              >
                <img
                  src={img}
                  alt={`preview-${i}`}
                  className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-200"
                  onError={(e) => (e.currentTarget.src = fallbackImages[1])}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right info */}
      <div className="flex flex-col pb-4">
        <div className="mt-2 md:mt-0">
          <h1 className="text-4xl font-podcast font-light mb-1 text-gray-800 leading-snug">
            {title}
          </h1>

          <p className="text-sm text-gray-500 mb-1">{destination}</p>

          <div className="mb-4">
            {percentDiscount > 0 ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500 line-through">
                  {formatCurrency(priceAdult)}
                </p>

                <p className="text-3xl text-orange-500 font-bold">
                  {formatCurrency(priceAdult * (1 - percentDiscount / 100))}
                </p>

                <p className="text-sm font-semibold text-green-600">
                  -{percentDiscount}% OFF
                </p>
              </div>
            ) : (
              <p className="text-3xl text-orange-500 font-bold">
                {formatCurrency(priceAdult)}
              </p>
            )}
          </div>

          <p className="text-gray-500 mb-5 leading-relaxed text-justify">
            {description}
          </p>

          <p className="font-medium mb-2 text-gray-700">Trip Duration</p>

          {/* Calendar + Book Now stack dọc */}
          <div className="flex flex-col mt-2">
            <div className="border rounded-2xl p-3 shadow-md w-[280px] sm:w-[300px] bg-white">
              {renderHeader()}
              {renderDays()}
              {renderCells()}
            </div>

            <button
              onClick={handleBuyNow}
              className="bg-orange-500 hover:bg-orange-600 text-white
                         w-[280px] sm:w-[300px]
                         rounded-full px-6 py-3 shadow-md
                         transition-all mt-4"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
