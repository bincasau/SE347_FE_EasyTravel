import { useState } from "react";

export default function ReviewsPage() {
  const reviews = [
    {
      stars: 4,
      text: "I have been thoroughly impressed with the level of service and product quality. Everything was seamless. Highly recommend!",
      name: "Marketing Manager, BrightSpark Solutions",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      stars: 5,
      text: "From start to finish, the team was incredible. They truly care about their customers.",
      name: "Business Analyst, StriveAhead Corp",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
      stars: 4,
      text: "From start to finish, everything exceeded expectations.",
      name: "Business Analyst, StriveAhead Corp",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      stars: 5,
      text: "I can’t say enough good things! Friendly, professional team.",
      name: "IT Consultant",
      avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    },
    {
      stars: 1,
      text: "Results fell short. Delivery delays and no updates.",
      name: "Small Business Owner, EcoCrafts",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      stars: 1,
      text: "Disappointing quality and missed deadlines.",
      name: "Small Business Owner, EcoCrafts",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    },
    {
      stars: 2,
      text: "Glitches everywhere, confusing menus.",
      name: "Teacher and Educational Blogger",
      avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    },
    {
      stars: 5,
      text: "Exceeded expectations and improved workflow.",
      name: "Content Strategist, ThinkBig Media",
      avatar: "https://randomuser.me/api/portraits/women/35.jpg",
    },
    {
      stars: 4,
      text: "Reliable, trustworthy service. Highly recommended!",
      name: "Content Strategist, ThinkBig Media",
      avatar: "https://randomuser.me/api/portraits/men/30.jpg",
    },
    {
      stars: 5,
      text: "Professional and high-quality from start to finish.",
      name: "Content Strategist, ThinkBig Media",
      avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    },
  ];

  const [showAll, setShowAll] = useState(false);

  const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* PAGE TITLE */}
      <h1 className="text-center text-3xl font-bold text-orange-500 mb-3">
        What People Are Saying About Us
      </h1>

      <p className="text-center text-gray-600 mb-5">Feedback about me</p>

      {/* BUTTON */}
      <div className="flex justify-center mb-12">
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-6 py-2 border border-orange-400 text-orange-500 rounded-md hover:bg-orange-50"
        >
          {showAll ? "Show Less" : "Get All Reviews"}
        </button>
      </div>

      {/* REVIEWS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleReviews.map((r, index) => (
          <div key={index} className="bg-gray-100 rounded-xl p-5 shadow-sm">
            {/* STARS */}
            <div className="flex space-x-1 mb-3">
              {Array.from({ length: r.stars }).map((_, i) => (
                <span key={i} className="text-green-500 text-xl">★</span>
              ))}
              {Array.from({ length: 5 - r.stars }).map((_, i) => (
                <span key={i} className="text-gray-400 text-xl">★</span>
              ))}
            </div>

            {/* TEXT */}
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              {r.text}
            </p>

            {/* AVATAR + NAME */}
            <div className="flex items-center gap-3 mt-4">
              <img
                src={r.avatar}
                className="w-10 h-10 rounded-full object-cover"
              />
              <p className="text-sm font-medium text-gray-700">{r.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
