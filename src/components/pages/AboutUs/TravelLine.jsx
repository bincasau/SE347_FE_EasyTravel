import ImgJourney from "../../../assets/images/AboutUs/journey.png";
import ImgBudget from "../../../assets/images/AboutUs/budget.png";
import ImgBus from "../../../assets/images/AboutUs/ImageBus.png";

export default function Travelline() {
  return (
    <section className="relative w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20 py-12 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-gray-700">
            Vacation Agency
          </p>
          <h2 className="font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-tight">
            The Best Holidays
            <br />
            Start Here!
          </h2>
        </div>

        <div className="relative">
          <span className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-black/50" />

          {[12, 48, 82].map((pos, index) => (
            <span
              key={index}
              className="hidden lg:block absolute left-1/2 w-4 h-4 rounded-full bg-white ring-2 ring-black/60"
              style={{ top: `${pos}%`, transform: "translateX(-50%)" }}
            />
          ))}

          <div className="grid lg:grid-cols-2 gap-x-12 gap-y-12 sm:gap-y-16 lg:gap-y-20 items-start">
            <div className="flex flex-col gap-y-12 sm:gap-y-16 lg:gap-y-20">
              <div className="flex flex-col items-center text-center">
                <img
                  src={ImgJourney}
                  className="rounded-xl w-full max-w-[520px] aspect-[16/10] object-cover"
                  alt="Journey"
                />
                <h3 className="font-semibold text-lg sm:text-xl mt-4">
                  Journey To Happiness
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mt-1 max-w-xl">
                  No one shall be denied their right to discover new places and
                  create lasting memories.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <img
                  src={ImgBus}
                  className="rounded-xl w-full max-w-[520px] aspect-[16/10] object-cover"
                  alt="Bus"
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-12 sm:gap-y-16 lg:gap-y-20 lg:mt-32">
              <div className="text-center lg:text-left">
                <h4 className="font-semibold text-lg sm:text-xl">
                  Traveling on a Budget
                </h4>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  No one shall be subjected to arbitrary arrest, detention or
                  exile. Everyone is entitled in full equality.
                </p>
                <img
                  src={ImgBudget}
                  className="rounded-xl w-full max-w-[520px] aspect-[16/10] object-cover mt-5 sm:mt-6 mx-auto lg:mx-0"
                  alt="Budget"
                />
              </div>

              <div className="text-center lg:text-left">
                <h4 className="font-semibold text-lg sm:text-xl">
                  Discover New Horizons
                </h4>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  Everyone has the right to explore the world and enjoy
                  unforgettable moments with full equality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

