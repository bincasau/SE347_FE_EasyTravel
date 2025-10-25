import ImgJourney from "../../../assets/images/AboutUs/journey.png";
import ImgBudget from "../../../assets/images/AboutUs/budget.png";
import ImgBus from "../../../assets/images/AboutUs/ImageBus.png";

export default function Travelline() {
  return (
    <section className="relative w-full bg-white">
      <div className="container mx-auto px-6 lg:px-20 py-16">
        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="font-poppins text-sm tracking-[0.25em] uppercase text-gray-700">
            Vacation Agency
          </p>
          <h2 className="font-poppins font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-tight">
            The Best Holidays
            <br />
            Start Here!
          </h2>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <span className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-black/50" />

          {/* Dots */}
          {[12, 48, 82].map((pos, index) => (
            <span
              key={index}
              className="hidden lg:block absolute left-1/2 w-4 h-4 rounded-full bg-white ring-2 ring-black/60"
              style={{ top: `${pos}%`, transform: "translateX(-50%)" }}
            />
          ))}

          {/* Layout */}
          <div className="grid lg:grid-cols-2 gap-x-12 gap-y-20 items-start">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-y-20">
              {/* Item 1 */}
              <div className="flex flex-col items-center text-center">
                <img
                  src={ImgJourney}
                  className="rounded-xl w-full max-w-[520px] aspect-[16/10] object-cover"
                />
                <h3 className="font-poppins font-semibold text-xl mt-4">
                  Journey To Happiness
                </h3>
                <p className="text-gray-600 text-base mt-1">
                  No one shall be denied their right to discover new places and
                  create lasting memories.
                </p>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center">
                <img
                  src={ImgBus}
                  className="rounded-xl w-full max-w-[520px] aspect-[16/10] object-cover"
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-y-20 lg:mt-32">
              {/* Item 3 */}
              <div>
                <h4 className="font-poppins font-semibold text-xl">
                  Traveling on a Budget
                </h4>
                <p className="text-base text-gray-600 mt-2">
                  No one shall be subjected to arbitrary arrest, detention or
                  exile. Everyone is entitled in full equality.
                </p>
                <img
                  src={ImgBudget}
                  className="rounded-xl w-full max-w-[520px] aspect-[16/10] object-cover mt-6 mx-auto"
                />
              </div>

              {/* Item 4 */}
              <div>
                <h4 className="font-poppins font-semibold text-xl">
                  Discover New Horizons
                </h4>
                <p className="text-base text-gray-600 mt-2">
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
