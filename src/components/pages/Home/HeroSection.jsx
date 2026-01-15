import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import bgImage from "@/assets/images/home/herosection_bg.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faMapMarkerAlt,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import { getDepartureLocations } from "@/apis/Tour"; // ✅ cần export hàm này trong Tour API

const HeroSection = () => {
  const { t } = useLang();
  const navigate = useNavigate();

  // ✅ form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");

  // ✅ fetch departure locations
  const [departureOptions, setDepartureOptions] = useState([]);
  const [loadingDeparture, setLoadingDeparture] = useState(false);

  // ✅ minStartDate = today + 2
  const minStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  // ✅ fetch departure list
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingDeparture(true);
        const list = await getDepartureLocations();
        if (!mounted) return;

        const safeList = Array.isArray(list) ? list : [];
        setDepartureOptions(safeList);
      } catch (e) {
        console.error("getDepartureLocations failed", e);
        if (!mounted) return;
        setDepartureOptions(["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"]); // fallback
      } finally {
        if (mounted) setLoadingDeparture(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ nếu endDate < startDate => clear
  useEffect(() => {
    if (!startDate || !endDate) return;
    if (endDate < startDate) setEndDate("");
  }, [startDate, endDate]);

  const handleSearch = () => {
    navigate("/tours", {
      state: {
        startDate: startDate || "", // rỗng thì TourPage tự default today+2
        endDate: endDate || "",
        departureLocation: departure || "",
        destination: destination || "",
      },
    });
  };

  return (
    <section
      className="relative w-full min-h-[85vh] md:h-[90vh] bg-cover bg-center flex flex-col justify-center items-center text-center text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 px-4 sm:px-6 w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 md:mb-4">
          {t("home.hero.title")}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 md:mb-10 max-w-3xl mx-auto">
          {t("home.hero.subtitle")}
        </p>

        <div
          className="relative w-full max-w-7xl mx-auto p-[2px] rounded-3xl 
          bg-gradient-to-b from-white/5 via-white/20 to-white/70 
          backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]"
        >
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl p-4 sm:p-6 md:p-8 border border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
              {/* START DATE */}
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendarDays} />
                  {t("home.hero.startDate")}
                </label>
                <input
                  type="date"
                  min={minStartDate}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-3 border rounded-xl text-gray-700 h-[48px] bg-white/80"
                />
                <div className="text-[11px] text-gray-500 mt-1">
                  * Min: {minStartDate}
                </div>
              </div>

              {/* END DATE */}
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendarDays} />
                  {t("home.hero.endDate")}
                </label>
                <input
                  type="date"
                  min={startDate || minStartDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-3 border rounded-xl text-gray-700 h-[48px] bg-white/80"
                />
              </div>

              {/* DEPARTURE */}
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {t("home.hero.departure")}
                </label>
                <select
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="p-3 border rounded-xl text-gray-700 h-[48px] bg-white/80"
                  disabled={loadingDeparture}
                >
                  <option value="">
                    {loadingDeparture
                      ? "Loading..."
                      : t("home.hero.selectDeparture")}
                  </option>
                  {departureOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESTINATION + SEARCH */}
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {t("home.hero.destination")}
                </label>

                <div className="flex w-full gap-2">
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="flex-1 h-[48px] px-3 border border-gray-300 rounded-xl text-gray-700 bg-white/80"
                  >
                    <option value="">{t("home.hero.selectDestination")}</option>
                    <option value="Phú Quốc">Phú Quốc</option>
                    <option value="Đà Lạt">Đà Lạt</option>
                    <option value="Huế">Huế</option>
                  </select>

                  <button
                    onClick={handleSearch}
                    className="h-[48px] w-[48px] flex items-center justify-center text-white rounded-xl transition-all duration-300 
                      bg-orange-500 hover:bg-orange-600 hover:scale-[1.05] active:scale-[0.95] shadow-md"
                    title="Search tours"
                  >
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="text-lg"
                    />
                  </button>
                </div>
              </div>
            </div>
            {/* end grid */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
