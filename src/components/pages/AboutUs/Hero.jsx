import HeroImage from "../../../assets/images/AboutUs/Hero.png";

export function Hero() {
  return (
    <section
      className="relative w-full min-h-[56vh] sm:min-h-[64vh] lg:min-h-[70vh]
                 text-white flex items-center justify-center
                 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${HeroImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 to-black/45" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl">
        <h1
          className="font-podcast font-normal
                     text-3xl sm:text-5xl lg:text-[72px]
                     tracking-[0.02em] leading-tight
                     drop-shadow-[0_2px_12px_rgba(0,0,0,.45)]"
        >
          Our team cares about your full relax
        </h1>

        <p
          className="mt-6 sm:mt-10 mx-auto max-w-2xl
                     text-[14px] sm:text-base font-light leading-7 sm:leading-8 tracking-wide
                     text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.45)]"
        >
          But I must explain to you how all this mistaken idea of denouncing
          pleasure and praising pain was born and I will give you a complete
          account of the system.
        </p>

        <a
          href="#packages"
          className="inline-flex items-center justify-center mt-8 sm:mt-12
                     px-6 sm:px-8 py-3
                     rounded-full border border-white/80 text-sm sm:text-base font-medium
                     tracking-wide backdrop-blur-md transition hover:bg-white/10"
        >
          View our Tour Packages
        </a>
      </div>
    </section>
  );
}
