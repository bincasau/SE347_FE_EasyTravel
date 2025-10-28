import React from "react";
import { useLang } from "@/contexts/LangContext";
import womanImg from "@/assets/images/home/offer_woman.png";

const OfferBanner = () => {
  const { t } = useLang();

  return (
    <section className="relative w-full font-poppins overflow-hidden">
      {/* Nền gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400"></div>

      <div className="relative max-w-7xl items-center mx-auto px-6 md:px-12 lg:px-20  grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nội dung bên trái */}
        <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8 text-center md:text-left max-w-md mx-auto md:mx-0 z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">
            {t("home.offerBanner.title") ||
              "Get Special Offers for Organizations"}
          </h2>
          <p className="text-gray-600 mb-5 leading-relaxed">
            {t("home.offerBanner.desc") ||
              "We provide exclusive travel deals and packages for groups and organizations. Get the best rates when you book early!"}
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-full transition">
            {t("home.offerBanner.button") || "Contact Us"}
          </button>
        </div>

        {/* Ảnh phụ nữ bên phải */}
        <div className="flex justify-center md:justify-end items-end">
          <img
            src={womanImg}
            alt="Travel woman"
            className="w-[220px] md:w-[280px] lg:w-[320px] h-auto object-contain drop-shadow-md translate-y-4"
          />
        </div>
      </div>
    </section>
  );
};

export default OfferBanner;
