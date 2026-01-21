import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { popup } from "@/utils/popup";
import { useLang } from "@/contexts/LangContext";

// Format VND
const formatVND = (n) =>
  Number(n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

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

export default function BookingStepTour1({
  bookingData,
  setBookingData,
  nextStep,
}) {
  const { t } = useLang();
  const [localDate, setLocalDate] = useState(
    bookingData.date ? new Date(bookingData.date) : null
  );

  const tour = bookingData.tourInfo;
  const availableSeats = bookingData.availableSeats ?? 0;

  if (!tour) {
    return <div className="text-gray-500">{t("tourPage.loading")}</div>;
  }

  const basePriceAdult = tour.priceAdult ?? 0;
  const basePriceChild = tour.priceChild ?? 0;
  const discountPercent = tour.percentDiscount ?? 0;
  const discountFactor = discountPercent > 0 ? 1 - discountPercent / 100 : 1;

  const priceAdult = basePriceAdult * discountFactor;
  const priceChild = basePriceChild * discountFactor;

  const { tickets = {} } = bookingData;
  const { adult = 0, child = 0 } = tickets;

  const handleDateChange = (d) => {
    setLocalDate(d);
    setBookingData({
      ...bookingData,
      date: d ? d.toISOString().split("T")[0] : "",
    });
  };

  const setQty = (key, qty) => {
    const newAdult = key === "adult" ? qty : adult;
    const newChild = key === "child" ? qty : child;

    if (availableSeats > 0 && newAdult + newChild > availableSeats) {
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

  const total = adult * priceAdult + child * priceChild;

  useEffect(() => {
    if (bookingData.total !== total) {
      setBookingData((prev) => ({ ...prev, total }));
    }
  }, [total, bookingData.total, setBookingData]);

  const disableAdultPlus = availableSeats > 0 && adult + child >= availableSeats;
  const disableChildPlus = availableSeats > 0 && adult + child >= availableSeats;

  const handleContinue = () => {
    if (adult + child === 0) {
      popup.error(t("tourPage.selectAtLeast"));
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-600 mb-2">{t("tourPage.selectDate")}</label>
        <div className="relative flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
          <FaCalendarAlt className="text-gray-500 mr-2" />
          <DatePicker
            selected={localDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            placeholderText={t("tourPage.chooseTravelDate")}
            showPopperArrow={false}
            className="w-full text-sm text-gray-800 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-800">{t("tourPage.adult")}</div>
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

        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-800">{t("tourPage.child")}</div>
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
          🎟 {t("tourPage.seats")} <b>{availableSeats}</b>
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {t("tourPage.back")}
        </button>

        <button
          onClick={handleContinue}
          className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          {t("tourPage.continue")}
        </button>
      </div>
    </div>
  );
}
