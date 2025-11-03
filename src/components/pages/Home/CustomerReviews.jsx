import React from "react";
import { useLang } from "@/contexts/LangContext";
import bgImage from "@/assets/images/Home/CustomerReviews_bg.png";
import customerImg from "@/assets/images/home/customer.png";
import { FaStar } from "react-icons/fa";

const CustomerReviews = () => {
  const { t } = useLang();

  return (
    <section
      className="relative w-full overflow-hidden font-poppins bg-white text-gray-900"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "top center",
      }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-20 text-center">
        {/* Subtitle */}
        <p className="text-[#eb662b] italic mb-2">
          {t("home.customerReviews.subtitle")}
        </p>

        {/* Title */}
        <h2 className="text-2xl md:text-4xl font-bold mb-12">
          {t("home.customerReviews.title")}
        </h2>

        {/* Content */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-left">
          {/* Customer image */}
          <img
            src={customerImg}
            alt="Customer"
            className="w-[200px] md:w-[260px] rounded-lg object-cover"
          />

          {/* Text content */}
          <div className="max-w-lg">
            {/* Rating */}
            <div className="flex gap-1 mb-4 text-[#eb662b]">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>

            {/* Review text */}
            <p className="text-gray-700 leading-relaxed mb-6">
              {t("home.customerReviews.review")}
            </p>

            {/* Customer info */}
            <div>
              <p className="font-semibold text-gray-900">
                {t("home.customerReviews.name")}
              </p>
              <p className="text-sm text-gray-500">
                {t("home.customerReviews.position")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
