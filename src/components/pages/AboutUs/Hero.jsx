import HeroImage from "../../../assets/images/AboutUs/Hero.png";

export function Hero() {
  return (
    <section
      className="relative w-full min-h-[70vh] text-white flex items-center justify-center
                 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${HeroImage})` }}
    >
      {/* Overlay nhẹ để không che nền */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl">
        {/* TITLE ✅ 1 dòng, không in đậm, chữ sang hơn */}
        <h1
          className="font-podcast font-normal whitespace-nowrap
                     text-4xl sm:text-5xl lg:text-[72px]
                     tracking-[0.02em] leading-tight
                     drop-shadow-[0_2px_12px_rgba(0,0,0,.45)]"
        >
          Our team cares about your full relax
        </h1>

        {/* DESCRIPTION — dòng nhỏ hơn, thưa chữ, thoáng hơn */}
        <p
          className="mt-10 mx-auto max-w-2xl text-[15px] sm:text-base font-light leading-8 tracking-wide
                     text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.45)]"
        >
          But I must explain to you how all this mistaken idea of denouncing
          pleasure and praising pain was born and I will give you a complete
          account of the system.
        </p>

        {/* BUTTON */}
        <a
          href="#packages"
          className="inline-flex items-center justify-center mt-12 px-8 py-3
             rounded-full border border-white/80 text-sm sm:text-base font-medium
             tracking-wide backdrop-blur-md transition hover:bg-white/10"
        >
          View our Tour Packages
        </a>
      </div>
    </section>
  );
}
