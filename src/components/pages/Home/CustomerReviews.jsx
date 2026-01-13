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
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20 text-center">
        <p className="text-[#eb662b] italic mb-2 text-sm sm:text-base">
          {t("home.customerReviews.subtitle")}
        </p>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-12">
          {t("home.customerReviews.title")}
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 text-left">
          <img
            src={customerImg}
            alt="Customer"
            className="w-[160px] sm:w-[200px] md:w-[260px] rounded-lg object-cover"
          />

          <div className="max-w-lg">
            <div className="flex gap-1 mb-3 md:mb-4 text-[#eb662b]">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>

            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-5 md:mb-6">
              {t("home.customerReviews.review")}
            </p>

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
