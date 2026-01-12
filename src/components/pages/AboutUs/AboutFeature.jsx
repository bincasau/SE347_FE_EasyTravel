import AboutImage from "../../../assets/images/AboutUs/AboutFeature.png";

export function AboutFeature() {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="flex justify-center">
          <img
            src={AboutImage}
            alt="City View"
            className="rounded-2xl shadow-lg w-full max-w-xl object-cover"
          />
        </div>

        <div className="text-gray-700 max-w-lg">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Welcome to our site!
          </p>

          <h2
            className="mt-3 font-poppins font-bold
                       text-3xl sm:text-4xl lg:text-[46px]
                       text-gray-900 leading-tight tracking-wide"
          >
            We Are The Center Of Việt Nam To Offer You The Best
          </h2>

          <p className="mt-5 sm:mt-6 text-sm leading-7">
            We are right in the center of Lucca to offer you the real city life!
            With years of experience in practically every tourism sector, with
            us you can find complete packages at the lowest price, to travel and
            learn and have fun all without worries and without stress. What are
            you waiting for, book a bright evening, a trip to beautiful Tuscany
            or a personal tour for you!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6 mt-8 sm:mt-10">
            <Stat title="20+" label={"Years\nExperience"} />
            <Stat title="100+" label={"Happy\nCustomer"} />
            <Stat title="15+" label={"Choice\nof Services"} />
            <Stat title="10+" label={"Professional\nGuides"} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ title, label }) {
  return (
    <div>
      <h3 className="text-primary font-bold text-xl">{title}</h3>
      <p className="text-xs leading-5 whitespace-pre-line">{label}</p>
    </div>
  );
}
