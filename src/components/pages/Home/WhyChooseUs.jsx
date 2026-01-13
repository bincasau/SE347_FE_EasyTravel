import React from "react";
import { useLang } from "@/contexts/LangContext";

import bgImage from "@/assets/images/home/whychooseus_bg.png";
import leftWoman from "@/assets/images/home/whychoose_left_woman.png";
import rightWoman from "@/assets/images/home/whychoose_right_woman.png";

import iconAgent from "@/assets/images/home/icon_agent.svg";
import iconSafety from "@/assets/images/home/icon_safety.svg";
import iconPrice from "@/assets/images/home/icon_price.svg";
import iconSupport from "@/assets/images/home/icon_support.svg";

const WhyChooseUs = () => {
  const { t } = useLang();

  const features = [
    {
      icon: iconAgent,
      title: t("home.whyChooseUs.features.agents.title"),
      desc: t("home.whyChooseUs.features.agents.desc"),
    },
    {
      icon: iconSafety,
      title: t("home.whyChooseUs.features.safety.title"),
      desc: t("home.whyChooseUs.features.safety.desc"),
    },
    {
      icon: iconPrice,
      title: t("home.whyChooseUs.features.price.title"),
      desc: t("home.whyChooseUs.features.price.desc"),
    },
    {
      icon: iconSupport,
      title: t("home.whyChooseUs.features.support.title"),
      desc: t("home.whyChooseUs.features.support.desc"),
    },
  ];

  return (
    <section
      className="relative w-full overflow-hidden text-white font-poppins"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        src={leftWoman}
        alt="Traveler Woman Left"
        className="hidden md:block absolute bottom-0 left-0 w-[22vw] max-w-[340px] object-contain z-20"
      />

      <img
        src={rightWoman}
        alt="Traveler Woman Right"
        className="hidden md:block absolute bottom-0 right-[2vw] w-[24vw] max-w-[380px] object-contain z-20"
      />

      <div className="relative z-10 w-[92%] md:w-[88%] max-w-[900px] mx-auto py-[6vh] md:py-[14vh] text-left">
        <p className="text-[#eb662b] text-sm sm:text-base md:text-lg font-medium mb-2 font-[cursive]">
          {t("home.whyChooseUs.subtitle")}
        </p>
        <h2 className="text-2xl md:text-4xl font-bold leading-snug mb-8 md:mb-10 max-w-[650px]">
          {t("home.whyChooseUs.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 sm:gap-y-8">
          {features.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-black/30 hover:bg-black/50 rounded-xl border border-transparent hover:border-yellow-400 transition-all duration-300 p-5"
            >
              <img src={item.icon} alt={item.title} className="w-8 h-8" />
              <div>
                <h4 className="font-semibold text-base md:text-lg mb-1">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
