import React from "react";
import { useLang } from "@/contexts/LangContext";
import bgImage from "@/assets/images/home/about_bg.png";
import personImg from "@/assets/images/home/about_person.png";

const AboutCompany = () => {
  const { t } = useLang();

  return (
    <section
      className="relative w-full font-poppins bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "75vh", // giữ đúng tỉ lệ nền gốc (khoảng 70–75% màn hình)
      }}
    >
      {/* Overlay tối để làm nổi chữ */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 max-w-7xl mx-auto h-full px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-center gap-10">
        {/* Left image */}
        <div className="flex justify-center md:justify-start items-center w-[260px] md:w-[320px] lg:w-[360px]">
          <img
            src={personImg}
            alt="Traveler"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* Right content */}
        <div className="text-left text-white max-w-[560px]">
          <p className="text-xs md:text-sm uppercase tracking-widest text-orange-300 mb-2">
            {t("home.aboutCompany.subtitle")}
          </p>

          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-snug text-white drop-shadow-lg">
            {t("home.aboutCompany.title")}
          </h2>

          <p className="text-sm md:text-base text-gray-100/90 leading-relaxed mb-6 max-w-[540px]">
            {t("home.aboutCompany.desc")}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-4 text-center md:text-left">
            {[
              { value: "20+", label: t("home.aboutCompany.years") },
              { value: "100+", label: t("home.aboutCompany.customers") },
              { value: "15+", label: t("home.aboutCompany.services") },
              { value: "10+", label: t("home.aboutCompany.guides") },
            ].map((item, idx) => (
              <div
                key={idx}
                className="transition-transform duration-500 hover:scale-105"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-orange-400 drop-shadow-md">
                  {item.value}
                </h3>
                <p className="text-xs md:text-sm text-gray-100/90 mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCompany;
