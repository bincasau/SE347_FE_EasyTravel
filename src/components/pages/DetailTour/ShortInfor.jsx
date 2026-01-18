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

import { getUserFromToken } from "@/utils/auth";
import { extractIdFromSlug, buildTourSlug } from "@/utils/slug";
import { popup } from "@/utils/popup";

export default function TourDetail() {
  const { slugId } = useParams();
  const navigate = useNavigate();

  const id = useMemo(() => extractIdFromSlug(slugId), [slugId]);

  const [tour, setTour] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  const [loading, setLoading] = useState(true);

  const S3_TOUR_IMG_BASE =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/image";

  // ✅ fallback images (tránh undefined + tránh broken image)
  const fallbackImages = useMemo(
    () => [
      "https://placehold.co/1200x800?text=Tour+Image",
      "https://placehold.co/600x400?text=Preview",
    ],
    []
  );

  useEffect(() => {
    const fetchTour = async () => {
      try {
        if (!id) {
          await popup.error("URL không hợp lệ (thiếu id).");
          setTour(null);
          return;
        }

        const res = await fetch(`http://localhost:8080/tours/${id}`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu tour");

        const data = await res.json();
        setTour(data);

        // ✅ đảm bảo URL slug đúng
        const correctSlugId = buildTourSlug(id, data?.title);
        if (slugId !== correctSlugId) {
          navigate(`/detailtour/${correctSlugId}`, { replace: true });
        }

        // ✅ build ảnh từ S3
        const s3Images = Array.from({ length: 5 }, (_, idx) => {
          const n = idx + 1;
          return `${S3_TOUR_IMG_BASE}/tour_${id}_img_${n}.jpg`;
        });

        setImages(s3Images);
        setSelectedImg(s3Images[0]);
      } catch (err) {
        console.error("❌ Lỗi khi fetch tour:", err);
        setTour(null);
        await popup.error(err?.message || "Không thể tải dữ liệu tour.");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchTour();
  }, [id, slugId, navigate]);

  useEffect(() => {
    if (images?.length) setSelectedImg(images[0]);
  }, [images]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Đang tải dữ liệu tour...
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-red-500">
        Không tìm thấy tour.
      </div>
    );
  }

  const {
    title,
    description,
    priceAdult,
    percentDiscount,
    startDate,
    endDate,
    destination,
    availableSeats,
  } = tour;

  const seatsLeft = Number(availableSeats ?? 0);
  const soldOut = seatsLeft <= 0;

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
            {isInRange && <div className="absolute inset-0 bg-orange-200 z-0" />}
            <div className={cellClass}>{formatted}</div>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-[0px] mb-[1px]" key={String(day)}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  // ✅ preview images = lấy từ images, tránh undefined
  const previewImages = images.slice(0, 3);
  const mainImg = selectedImg || images[0] || fallbackImages[0];

  const getToken = () =>
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const handleBuyNow = async () => {
    if (soldOut) {
      await popup.error("Tour đã hết chỗ. Vui lòng chọn tour khác.");
      return;
    }

    const token = getToken();
    if (!token) {
      const ok = await popup.confirm(
        "Bạn cần đăng nhập để đặt tour. Mở trang đăng nhập ngay?",
        "Yêu cầu đăng nhập"
      );
      if (ok) window.dispatchEvent(new Event("open-login"));
      return;
    }

    const jwtUser = getUserFromToken();
    const role = String(jwtUser?.role || "").toUpperCase();

    if (role === "TOUR_GUIDE") {
      await popup.error("Vui lòng đăng nhập bằng tài khoản USER để đặt tour.");
      return;
    }

    navigate(`/booking/${buildTourSlug(id, title)}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid md:grid-cols-2 gap-6 md:gap-8 items-start overflow-x-hidden">
      {/* Left images */}
      <div className="flex flex-col relative">
        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/tours")
          }
          className="mb-3 inline-flex w-fit items-center gap-2 
            border border-orange-500 text-orange-500 
            bg-white text-[15px] font-medium 
            px-4 py-1.5 rounded-md
            hover:bg-orange-500 hover:text-white 
            transition-all duration-200 shadow-sm"
        >
          ← Back
        </button>

        {/* ✅ responsive height: mobile thấp hơn để không “bự quá” */}
        <div className="w-full rounded-2xl overflow-hidden shadow-md bg-gray-100">
          <img
            src={mainImg}
            alt={title}
            className="w-full h-[320px] sm:h-[420px] lg:h-[560px] object-cover transition-transform duration-200 hover:scale-[1.01]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImages[0];
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
          {previewImages.map((img, i) => {
            const isActive = img === mainImg;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImg(img)}
                className={[
                  "rounded-xl overflow-hidden bg-gray-100 shadow-sm",
                  "h-[90px] sm:h-[120px] lg:h-[140px] w-full",
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
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImages[1];
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right info */}
      <div className="flex flex-col pb-4">
        <div className="mt-2 md:mt-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-podcast font-light mb-1 text-gray-800 leading-snug">
            {title}
          </h1>

          <p className="text-sm text-gray-500 mb-1">{destination}</p>

          <div className="mb-4">
            {percentDiscount > 0 ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500 line-through">
                  {formatCurrency(priceAdult)}
                </p>

                <p className="text-2xl sm:text-3xl text-orange-500 font-bold">
                  {formatCurrency(priceAdult * (1 - percentDiscount / 100))}
                </p>

                <p className="text-sm font-semibold text-green-600">
                  -{percentDiscount}% OFF
                </p>
              </div>
            ) : (
              <p className="text-2xl sm:text-3xl text-orange-500 font-bold">
                {formatCurrency(priceAdult)}
              </p>
            )}
          </div>

          <p className="text-gray-500 mb-5 leading-relaxed text-justify">
            {description}
          </p>

          <p className="font-medium mb-2 text-gray-700">Trip Duration</p>

          {/* ✅ Calendar + Book Now: full width mobile, gọn desktop */}
          <div className="flex flex-col mt-2 w-full max-w-[360px]">
            <div className="border rounded-2xl p-3 shadow-md w-full bg-white">
              {renderHeader()}
              {renderDays()}
              {renderCells()}
            </div>

            <div className="mt-3 w-full text-sm">
              {soldOut ? (
                <span className="text-red-500 font-medium">Hết chỗ</span>
              ) : (
                <span className="text-green-600">
                  Còn <span className="font-semibold">{seatsLeft}</span> chỗ
                </span>
              )}
            </div>

            <button
              onClick={handleBuyNow}
              disabled={soldOut}
              className={[
                "w-full rounded-full px-6 py-3 shadow-md transition-all mt-3",
                soldOut
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white",
              ].join(" ")}
            >
              {soldOut ? "Sold out" : "Book Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
