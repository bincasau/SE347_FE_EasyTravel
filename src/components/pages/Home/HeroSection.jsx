import React, { useState } from "react";
import { useLang } from "@/contexts/LangContext";
import bgImage from "@/assets/images/home/herosection_bg.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCalendarDays,
  faMapMarkerAlt,
  faMagnifyingGlass,
  faGlobe,
  faUserGroup,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const HeroSection = () => {
  const [tourType, setTourType] = useState("public");
  const { t } = useLang();

  return (
    <section
      className="relative w-full h-[90vh] bg-cover bg-center flex flex-col justify-center items-center text-center text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 px-4 w-full">
        <h1 className="text-5xl font-semibold mb-4">{t("home.hero.title")}</h1>
        <p className="text-lg text-gray-200 mb-10">{t("home.hero.subtitle")}</p>

        {/* Search Box */}
        <div
          className="relative w-full max-w-7xl mx-auto p-[2px] rounded-3xl 
          bg-gradient-to-b from-white/5 via-white/20 to-white/70 
          backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]"
        >
          {/* Inner Glass Form */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl p-8 border border-white/20">
            {/* Tabs */}
            <div className="flex justify-start gap-4 mb-6">
              <button
                className={`px-5 py-2 rounded-xl flex items-center gap-2 font-medium transition ${
                  tourType === "public"
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-700 bg-white/60 border border-gray-200 hover:bg-white/80"
                }`}
                onClick={() => setTourType("public")}
              >
                <FontAwesomeIcon icon={faGlobe} />
                {t("home.hero.publicTour")}
              </button>

              <button
                className={`px-5 py-2 rounded-xl flex items-center gap-2 font-medium transition ${
                  tourType === "private"
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-700 bg-white/60 border border-gray-200 hover:bg-white/80"
                }`}
                onClick={() => setTourType("private")}
              >
                <FontAwesomeIcon icon={faUserGroup} />
                {t("home.hero.privateTour")}
              </button>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Number of People */}
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faUsers} />
                  {t("home.hero.people")}
                </label>
                <select className="p-3 border rounded-xl text-gray-700 h-[48px] bg-white/80">
                  <option>{t("home.hero.chooseNumber")}</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendarDays} />
                  {t("home.hero.startDate")}
                </label>
                <input
                  type="date"
                  className="p-3 border rounded-xl text-gray-700 h-[48px] bg-white/80"
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendarDays} />
                  {t("home.hero.endDate")}
                </label>
                <input
                  type="date"
                  className="p-3 border rounded-xl text-gray-700 h-[48px] bg-white/80"
                />
              </div>

              {/* Departure */}
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {t("home.hero.departure")}
                </label>
                <select className="p-3 border rounded-xl text-gray-700 h-[48px] bg-white/80">
                  <option>{t("home.hero.selectDeparture")}</option>
                  <option>Hà Nội</option>
                  <option>Hồ Chí Minh</option>
                  <option>Đà Nẵng</option>
                </select>
              </div>

              {/* Destination */}
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {t("home.hero.destination")}
                </label>
                <div className="flex w-full gap-2">
                  <select className="flex-1 h-[48px] px-3 border border-gray-300 rounded-xl text-gray-700 bg-white/80">
                    <option>{t("home.hero.selectDestination")}</option>
                    <option>Phú Quốc</option>
                    <option>Đà Lạt</option>
                    <option>Huế</option>
                  </select>

                  <button
                    className={`h-[48px] w-[48px] flex items-center justify-center text-white rounded-xl transition-all duration-300 
                      ${
                        tourType === "public"
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-green-600 hover:bg-green-700"
                      } hover:scale-[1.05] active:scale-[0.95] shadow-md`}
                  >
                    <FontAwesomeIcon
                      icon={
                        tourType === "public" ? faMagnifyingGlass : faEnvelope
                      }
                      className="text-lg"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
