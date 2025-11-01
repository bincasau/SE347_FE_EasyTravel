import React from "react";
import { useNavigate } from "react-router-dom";
import Blog6 from "../../../assets/images/Blog/blog6.jpg";
import Blog7 from "../../../assets/images/Blog/blog7.jpg";
import Blog8 from "../../../assets/images/Blog/blog8.jpg";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaPinterestP,
  FaWhatsapp,
  FaLink,
  FaArrowLeft,
} from "react-icons/fa";

const BlogDetailContent = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/blog"); // hoặc navigate(-1) nếu muốn quay lại trang trước
  };

  const currentUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(
    "The Impact of Covid-19 on travel & tourism industry"
  );

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${shareText}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${currentUrl}&description=${shareText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${currentUrl}`,
  };

  return (
    <div>
      {/* ---------- BACK BUTTON ---------- */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium mb-5 transition"
      >
        <FaArrowLeft className="text-sm" />
        <span>Back</span>
      </button>

      {/* ---------- IMAGE + META ---------- */}
      <img
        src={Blog6}
        alt="The Impact of Covid-19 on travel & tourism industry"
        className="w-full h-[420px] object-cover rounded-2xl"
      />

      <div className="mt-6 text-sm text-gray-500">
        July 13, 2023 • <span className="text-gray-600 font-medium">Admin</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mt-2 leading-snug">
        The Impact of Covid-19 on travel & tourism industry
      </h1>

      {/* ---------- CONTENT ---------- */}
      <div className="prose prose-lg max-w-none mt-6 text-gray-700 leading-relaxed">
        <p>
          The global travel and tourism industry has witnessed unprecedented
          challenges since the onset of Covid-19. From grounded flights to empty
          landmarks, the pandemic reshaped how people explore the world. Yet,
          behind these disruptions lies a remarkable story of resilience,
          adaptation, and transformation.
        </p>

        <p>
          As restrictions ease and confidence returns, travelers have developed
          a newfound appreciation for sustainability, safety, and authenticity.
          Airlines are redesigning cabin experiences; destinations are investing
          in cleaner, greener infrastructure; and digital nomadism is becoming
          the new normal.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-2">
          1. How the pandemic transformed travel behavior
        </h2>
        <p>
          Before 2020, over-tourism was one of the major challenges faced by
          popular destinations like Venice, Bali, and Barcelona. However, the
          pandemic forced both travelers and tourism authorities to rethink
          crowd management and value-based travel. Now, travelers are favoring
          open-air destinations, smaller group experiences, and remote getaways.
        </p>

        <ul className="list-disc pl-6">
          <li>Rise of staycations and domestic tourism</li>
          <li>Increased preference for eco-friendly stays</li>
          <li>Demand for flexible cancellation policies</li>
          <li>Digital health passports and touchless check-ins</li>
        </ul>

        <p>
          Today, people travel with a different mindset — seeking meaning rather
          than mere sightseeing. Experiences like forest bathing in Japan,
          remote work retreats in Thailand, or volunteer trips in Kenya are now
          shaping what “luxury” means in travel.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-2">
          2. Technology: The backbone of the new travel era
        </h2>
        <p>
          Technology played a critical role in reviving confidence among
          travelers. AI-driven travel apps, virtual reality tours, and
          blockchain-based booking systems are paving the way for safer,
          personalized journeys. Airlines now use predictive analytics to
          monitor safety compliance, while hotels leverage smart sensors to
          maintain hygiene standards.
        </p>

        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-6">
          “Travel is no longer about checking off destinations — it’s about
          connecting deeply, responsibly, and meaningfully.”
        </blockquote>

        <p>
          Even social media platforms have evolved into planning tools. On
          TikTok, short “travel hacks” videos get millions of views daily,
          helping travelers discover hidden gems. Meanwhile, Google Maps’ live
          updates let users know which attractions are crowded in real time.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-2">
          3. The rebirth of sustainable tourism
        </h2>
        <p>
          Sustainable tourism is no longer a niche; it’s a necessity. Travelers
          are consciously choosing carbon-neutral flights, volunteering for
          conservation efforts, and supporting local artisans. Governments are
          also incentivizing eco-certifications and green hospitality.
        </p>

        <img
          src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=900&q=60"
          alt="eco travel"
          className="rounded-xl my-6 w-full object-cover"
        />

        <p>
          According to the World Tourism Organization, the next decade will see
          a dramatic shift towards regenerative travel — tourism that actively
          improves the destinations it touches. This approach encourages
          visitors to give back — planting trees, cleaning beaches, or funding
          community projects.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-2">
          4. What’s next for global travelers?
        </h2>
        <p>
          With 5G connectivity expanding globally and remote work becoming
          mainstream, the future traveler will likely be a “global citizen”
          working from anywhere — sipping coffee in Paris one week and attending
          Zoom calls from Bali the next. The focus will remain on authenticity,
          community, and mindful exploration.
        </p>

        <p>
          The travel & tourism industry has weathered many storms, but this time
          it emerged smarter and more human-centric. Covid-19 didn’t just pause
          travel; it redefined it forever.
        </p>
      </div>

      {/* ---------- TAGS + SHARE ---------- */}
      <div className="flex flex-wrap items-center justify-between mt-10 border-b border-gray-100 pb-6">
        <div className="flex gap-2 flex-wrap">
          {["Destination", "Museums", "Adventure"].map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Share:</h3>
          <div className="flex gap-4 text-gray-600 text-lg">
            <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className="hover:text-blue-600"><FaFacebookF /></a>
            <a href={shareLinks.twitter} target="_blank" rel="noreferrer" className="hover:text-sky-400"><FaTwitter /></a>
            <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="hover:text-green-500"><FaWhatsapp /></a>
            <a href={shareLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-700"><FaLinkedinIn /></a>
            <a href={shareLinks.pinterest} target="_blank" rel="noreferrer" className="hover:text-red-500"><FaPinterestP /></a>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="hover:text-gray-800"
            >
              <FaLink />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- AUTHOR CARD ---------- */}
      <div className="mt-10 bg-gray-50 rounded-xl p-6 flex items-center gap-4">
        <img
          src="https://i.pravatar.cc/100?img=8"
          alt="Sindy Simmons"
          className="w-16 h-16 rounded-full object-cover border"
        />
        <div>
          <h4 className="font-semibold text-gray-800">Sindy Simmons</h4>
          <p className="text-sm text-gray-500">Author</p>
          <p className="text-gray-600 text-sm mt-1">
            Sindy is a travel journalist with over 12 years of experience
            writing for National Geographic, Lonely Planet, and The Guardian.
            She believes travel is a tool for empathy and cultural exchange.
          </p>
        </div>
      </div>

      {/* ---------- PREV / NEXT SECTION ---------- */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        {/* Dòng nút điều hướng trên */}
        <div className="flex justify-between text-sm font-medium text-blue-900 mb-5">
          <button className="flex items-center gap-1 hover:text-blue-600 transition">
            <span className="text-lg">←</span> Prev
          </button>
          <button className="flex items-center gap-1 hover:text-blue-600 transition">
            Next <span className="text-lg">→</span>
          </button>
        </div>

        {/* Hai blog preview bên dưới */}
        <div className="flex justify-between flex-wrap gap-4">
          {/* Prev Blog */}
          <div className="flex items-center gap-3 max-w-[45%] cursor-pointer group">
            <div className="w-24 h-16 overflow-hidden rounded-lg">
              <img
                src={Blog8}
                alt="Previous blog"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sep 26, 2021 · Admin</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 leading-snug">
                The Impact of Covid-19 on travel & tourism industry
              </p>
            </div>
          </div>

          {/* Next Blog */}
          <div className="flex items-center gap-3 max-w-[45%] cursor-pointer justify-end group">
            <div className="text-right">
              <p className="text-xs text-gray-500">Sep 28, 2021 · Admin</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 leading-snug">
                Exploring the wonders of ancient Egypt
              </p>
            </div>
            <div className="w-24 h-16 overflow-hidden rounded-lg">
              <img
                src={Blog7}
                alt="Next blog"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailContent;
