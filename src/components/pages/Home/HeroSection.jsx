import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import bgImage from "@/assets/images/home/herosection_bg.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faMapMarkerAlt,
  faMagnifyingGlass,
  faUsers,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

import { getDepartureLocations } from "@/apis/Tour";
import { getPublicNotifications } from "@/apis/NotificationAPI";

const HeroSection = () => {
  const { t } = useLang();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [people, setPeople] = useState(1);
  const [departure, setDeparture] = useState("");
  const [departureOptions, setDepartureOptions] = useState([]);
  const [loadingDeparture, setLoadingDeparture] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [showBroadcast, setShowBroadcast] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("jwt"));

  const minStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const formatDMY = (ymd) => {
    if (!ymd) return "";
    const [y, m, d] = String(ymd).split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
  };

  const dateInputRef = useRef(null);
  const openDatePicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.click();
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingDeparture(true);
        const list = await getDepartureLocations();
        if (!mounted) return;
        setDepartureOptions(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!mounted) return;
        setDepartureOptions(["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"]);
      } finally {
        if (mounted) setLoadingDeparture(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const sortByTimeDesc = (arr) =>
    [...arr].sort((a, b) => {
      const ta = new Date(a.time || a.createdAt || a.updatedAt || 0).getTime();
      const tb = new Date(b.time || b.createdAt || b.updatedAt || 0).getTime();
      return (tb || 0) - (ta || 0);
    });

  const loadBroadcast = async () => {
    try {
      const publicList = await getPublicNotifications().catch(() => []);
      const sorted = sortByTimeDesc(Array.isArray(publicList) ? publicList : []);
      const messages = sorted
        .map((x) => (x?.message != null ? String(x.message).trim() : ""))
        .filter(Boolean);
      const joined = messages.join("  •  ");
      setBroadcastText(joined);
      setShowBroadcast(true);
    } catch (e) {
      setBroadcastText("");
    }
  };

  useEffect(() => {
    let alive = true;
    const timers = [];

    const syncLogin = () => {
      if (!alive) return;
      setIsLoggedIn(!!localStorage.getItem("jwt"));
    };

    [0, 200, 600, 1200, 2000].forEach((ms) => {
      timers.push(setTimeout(syncLogin, ms));
    });

    const interval = setInterval(syncLogin, 1000);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) return;
    loadBroadcast();
  }, [isLoggedIn]);

  const shouldShowTicker = !isLoggedIn && showBroadcast && !!broadcastText?.trim();

  const handleSearch = () => {
    const payload = {
      startDate: startDate || "",
      endDate: "",
      departureLocation: departure || "",
      departure: departure || "",
      durationDay: durationDays || "",
      durationDays: durationDays || "",
      people: Number(people || 1),
    };

    navigate("/tours", { state: payload, replace: true });
  };

  return (
    <section
      className="relative w-full min-h-[85vh] md:h-[90vh] bg-cover bg-center flex flex-col justify-center items-center text-center text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <style>
        {`
          @keyframes heroMarquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>

      <div className="relative z-10 px-4 sm:px-6 w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 md:mb-4">
          {t("home.hero.title")}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 md:mb-6 max-w-3xl mx-auto">
          {t("home.hero.subtitle")}
        </p>

        {shouldShowTicker && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/25 bg-black/35 backdrop-blur-md">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500 text-white shadow">
                  BROADCAST
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowBroadcast(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 grid place-items-center rounded-full hover:bg-white/10"
                aria-label="Close broadcast"
              >
                ✕
              </button>

              <div className="py-2 pl-28 pr-12">
                <div className="relative overflow-hidden">
                  <div
                    className="whitespace-nowrap text-sm sm:text-base text-white/95 font-medium inline-block"
                    style={{
                      animation: "heroMarquee 18s linear infinite",
                      willChange: "transform",
                    }}
                  >
                    {broadcastText}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className="relative w-full max-w-7xl mx-auto p-[2px] rounded-3xl 
          bg-gradient-to-b from-white/5 via-white/20 to-white/70 
          backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]"
        >
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl p-4 sm:p-6 md:p-8 border border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarDays} />
                  Ngày đi
                </label>

                <button
                  type="button"
                  onClick={openDatePicker}
                  className="h-[48px] px-3 border rounded-xl text-gray-700 bg-white/80 text-left flex items-center justify-between"
                >
                  <span className={startDate ? "" : "text-gray-400"}>
                    {startDate ? formatDMY(startDate) : "dd/mm/yyyy"}
                  </span>
                </button>

                <input
                  ref={dateInputRef}
                  type="date"
                  min={minStartDate}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="sr-only"
                />
              </div>

              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} />
                  Đi mấy ngày
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="h-[48px] px-3 border rounded-xl text-gray-700 bg-white/80"
                >
                  <option value="">Tất cả</option>
                  {[2, 3, 4, 5, 7, 10].map((d) => (
                    <option key={d} value={String(d)}>
                      {d} ngày
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} />
                  Số người
                </label>
                <input
                  type="number"
                  min={1}
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  className="h-[48px] px-3 border rounded-xl text-gray-700 bg-white/80"
                  placeholder="1"
                />
              </div>

              <div className="flex flex-col text-left">
                <label className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Điểm đi
                </label>
                <select
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="h-[48px] px-3 border rounded-xl text-gray-700 bg-white/80"
                  disabled={loadingDeparture}
                >
                  <option value="">{loadingDeparture ? "Loading..." : "Tất cả"}</option>
                  {departureOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSearch}
                className="h-[48px] w-full flex items-center justify-center gap-2 text-white rounded-xl transition-all duration-300
                  bg-orange-500 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] shadow-md font-semibold"
                title="Search tours"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-base" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
