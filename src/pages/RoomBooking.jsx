import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BookingStep1 from "@/components/pages/Booking/BookingStep1";
import BookingStep2 from "@/components/pages/Booking/BookingStep2";
import BookingStep3 from "@/components/pages/Booking/BookingStep3";

import { extractIdFromSlug, buildTourSlug } from "@/utils/slug";

export default function RoomBooking() {
  const [step, setStep] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const rawHotel = params.get("hotel") || "";
  const rawRoom = params.get("room") || "";

  const hotelId = useMemo(() => {
    const n = Number(rawHotel);
    if (Number.isFinite(n) && n > 0) return n;
    return extractIdFromSlug(rawHotel);
  }, [rawHotel]);

  const roomId = useMemo(() => {
    const n = Number(rawRoom);
    if (Number.isFinite(n) && n > 0) return n;
    return extractIdFromSlug(rawRoom);
  }, [rawRoom]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dữ liệu booking dùng xuyên suốt các bước
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    hotel: {
      id: null,
      name: "",
      address: "",
      main_image: "",
    },
    room: {
      id: null,
      type: "",
      price: 0,
      desc: "",
      guests: 0,
      image_bed: "",
    },
    total: 0,
    user: {
      name: "",
      surname: "",
      phone: "",
      email: "",
    },
  });

  // Fetch thông tin khách sạn và phòng
  useEffect(() => {
    if (!hotelId || !roomId) {
      setError("Thiếu thông tin phòng hoặc khách sạn (URL/query không hợp lệ).");
      setIsLoading(false);
      return;
    }

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const roomRes = await fetch(
          `http://localhost:8080/hotels/${hotelId}/rooms/${roomId}`
        );
        if (!roomRes.ok) throw new Error("Lỗi tải phòng");
        const room = await roomRes.json();

        const hotelRes = await fetch(`http://localhost:8080/hotels/${hotelId}`);
        if (!hotelRes.ok) throw new Error("Lỗi tải khách sạn");
        const hotel = await hotelRes.json();

        setBookingData((prev) => ({
          ...prev,
          hotel: {
            id: hotel.hotelId ?? hotel.id ?? hotelId,
            name: hotel.name || "",
            address: hotel.address || "",
            main_image: hotel.mainImage || "",
          },
          room: {
            id: room.roomId ?? room.id ?? roomId,
            type: room.roomType || "",
            price: room.price || 0,
            desc: room.desc || "",
            guests: room.numberOfGuest || 0,
            image_bed: room.imageBed || "",
          },
          total: room.price || 0,
        }));
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu đặt phòng.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [hotelId, roomId]);

  // Điều hướng bước
  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  //  Quay lại trang chi tiết khách sạn (đúng slug route)
  const backToHotel = () => {
    if (!hotelId) return;

    // nếu rawHotel là slug-id thì quay về slug đó luôn
    if (rawHotel && isNaN(Number(rawHotel))) {
      navigate(`/detailhotel/${rawHotel}`);
      return;
    }

    // nếu rawHotel là số thì tạo slug từ tên (nếu có)
    const hotelTitle = bookingData.hotel?.name || "hotel";
    const slugId = buildTourSlug(hotelId, hotelTitle);
    navigate(`/detailhotel/${slugId}`);
  };

  // Thanh step
  const Stepper = () => (
    <div className="flex items-center justify-center gap-10 mb-10 text-sm">
      {[
        { n: 1, label: "Booking Details" },
        { n: 2, label: "Your Details" },
        { n: 3, label: "Payment" },
      ].map((s, i) => (
        <div key={s.n} className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full grid place-items-center ${
              step === s.n
                ? "bg-orange-500 text-white"
                : step > s.n
                ? "bg-orange-100 text-orange-500"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {s.n}
          </div>
          <span
            className={
              step === s.n ? "text-orange-500 font-medium" : "text-gray-500"
            }
          >
            {s.label}
          </span>
          {i < 2 && <div className="w-28 h-[2px] bg-gray-200" />}
        </div>
      ))}
    </div>
  );

  // Render nội dung từng bước
  const renderStep = () => {
    if (isLoading) {
      return (
        <p className="text-center text-gray-400 animate-pulse">
          Đang tải dữ liệu phòng...
        </p>
      );
    }

    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    switch (step) {
      case 1:
        return (
          <BookingStep1
            bookingData={bookingData}
            setBookingData={setBookingData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <BookingStep2
            bookingData={bookingData}
            setBookingData={setBookingData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <BookingStep3
            bookingData={bookingData}
            setBookingData={setBookingData}
            prevStep={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <button
          onClick={backToHotel}
          className="mb-6 border border-orange-500 text-orange-500 px-4 py-1.5 rounded-md hover:bg-orange-500 hover:text-white transition"
        >
          Quay lại khách sạn
        </button>
      </div>

      <Stepper />

      <div className="max-w-6xl mx-auto px-6">{renderStep()}</div>
    </div>
  );
}
