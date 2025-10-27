import AboutImage from "../../../assets/images/AboutUs/AboutFeature.png";

export function AboutFeature() {
  return (
    <section className="w-full py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* IMAGE */}
        <div className="flex justify-center">
          <img
            src={AboutImage}
            alt="City View"
            className="rounded-2xl shadow-lg w-full max-w-xl object-cover"
          />
        </div>

        {/* CONTENT */}
        <div className="text-gray-700 max-w-lg">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Welcome to our site!
          </p>

          {/* ✅ Title to + không cần <br/> */}
          <h2
            className="mt-3 font-poppins font-bold
                       text-4xl sm:text-5xl lg:text-[46px]
                       text-gray-900 leading-tight tracking-wide"
          >
            We Are The Center Of Việt Nam To Offer You The Best
          </h2>

          <p className="mt-6 text-sm leading-7">
            We are right in the center of Lucca to offer you the real city life!
            With years of experience in practically every tourism sector, with
            us you can find complete packages at the lowest price, to travel and
            learn and have fun all without worries and without stress. What are
            you waiting for, book a bright evening, a trip to beautiful Tuscany
            or a personal tour for you!
          </p>

          {/* STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
            <div>
              <h3 className="text-primary font-bold text-xl">20+</h3>
              <p className="text-xs leading-5">
                Years
                <br />
                Experience
              </p>
            </div>

            <div>
              <h3 className="text-primary font-bold text-xl">100+</h3>
              <p className="text-xs leading-5">
                Happy
                <br />
                Customer
              </p>
            </div>

            <div>
              <h3 className="text-primary font-bold text-xl">15+</h3>
              <p className="text-xs leading-5">
                Choice
                <br />
                of Services
              </p>
            </div>

            <div>
              <h3 className="text-primary font-bold text-xl">10+</h3>
              <p className="text-xs leading-5">
                Professional
                <br />
                Guides
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
