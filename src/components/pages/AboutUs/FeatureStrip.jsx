import "@fortawesome/fontawesome-free/css/all.min.css";

export function FeatureStrip() {
  const items = [
    {
      icon: "fa-solid fa-map-location-dot",
      text: "Complete Packages For All Your Wishes",
    },
    {
      icon: "fa-solid fa-award",
      text: "Over 30 Years Of Experience",
    },
    {
      icon: "fa-solid fa-user-tie",
      text: "Expert Guides For You",
    },
    {
      icon: "fa-solid fa-hand-holding-dollar",
      text: "Guaranteed fun at the best price!",
    },
  ];

  return (
    <section className="relative w-full">
      <div className="bg-gradient-to-r from-[#FFD0A6] via-[#FFBF8F] to-[#FFB07A]">
        <div className="container mx-auto px-6 lg:px-16 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <FeatureCard key={index} icon={item.icon} text={item.text} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, text }) {
  return (
    <div
      className="rounded-2xl bg-white/55 backdrop-blur-sm border border-white/60
                 shadow-[0_6px_24px_rgba(0,0,0,0.06)]
                 px-6 py-8 flex flex-col items-center text-center
                 transition hover:bg-white/70 hover:-translate-y-1"
    >
      <i className={`${icon} text-[#E27A14] text-3xl mb-4`}></i>

      <p className="text-sm font-poppins font-bold text-gray-800 leading-6">
        {text}
      </p>
    </div>
  );
}
