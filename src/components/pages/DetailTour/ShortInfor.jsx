import React, { useEffect, useState } from "react";
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

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`http://localhost:8080/tours/${id}`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu tour");
        const data = await res.json();
        setTour(data);

        const imagesHref = data._links?.images?.href;
        if (imagesHref) {
          const imgRes = await fetch(imagesHref);
          if (!imgRes.ok) throw new Error("Không thể tải ảnh");
          const imgData = await imgRes.json();

          const list = imgData._embedded?.images || [];
          const formatted = list.map((img) => {
            const url = img.url || img.imageUrl || img.name || img.path;
            return /^https?:\/\//i.test(url) ? url : `/images/tour/${url}`;
          });

          setImages(formatted);
        }
      } catch (err) {
        console.error("❌ Lỗi khi fetch tour:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

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
    mainImage,
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

  const mainImg =
    images[0] || (mainImage ? `/images/tour/${mainImage}` : travel1);

  const previewImages =
    images.length > 1 ? images.slice(1, 4) : [travel2, travel3, travel4];

  const handleBuyNow = () => {
    navigate(`/booking/${id}`, {
      state: { tour, images },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-10 items-end">
      {/* Left images */}
      <div className="flex flex-col relative">
        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/tours")
          }
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
          src={mainImg}
          alt={title}
          className="rounded-2xl w-full h-[540px] object-cover shadow-md hover:scale-[1.01] transition"
          onError={(e) => (e.currentTarget.src = travel1)}
        />

        <div className="flex gap-4 mt-4">
          {previewImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`preview-${i}`}
              className="w-1/3 h-32 rounded-xl object-cover hover:scale-105 transition"
              onError={(e) => (e.currentTarget.src = travel2)}
            />
          ))}
        </div>
      </div>

      {/* Right info */}
      <div className="flex flex-col justify-between h-full pb-4">
        <div className="mt-[60px]">
          <h1 className="text-4xl font-podcast font-light mb-1 text-gray-800 leading-snug">
            {title}
          </h1>

          <p className="text-sm text-gray-500 mb-1">{destination}</p>

          {/* ⭐ PRICE + DISCOUNT ⭐ */}
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
          Book Now
        </button>
      </div>
    </div>
  );
}
