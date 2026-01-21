import "@fortawesome/fontawesome-free/css/all.min.css";

import ImgPhi from "../../../assets/images/AboutUs/phi.png";
import ImgNhan from "../../../assets/images/AboutUs/nhan.png";
import ImgVu from "../../../assets/images/AboutUs/vu.png";

export default function OurMember() {
  const members = [
    { img: ImgPhi, name: "Huỳnh Tuấn Phi", role: "Founder" },
    { img: ImgNhan, name: "Võ Thành Nhân", role: "Founder" },
    { img: ImgVu, name: "Nguyễn Lý Anh Vũ", role: "Founder" },
  ];

  return (
    <section className="w-full py-12 sm:py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20 text-center">
        <div className="inline-block px-6 sm:px-8 py-2 rounded-full mb-4 bg-amber-100">
          <span className="text-xl sm:text-2xl tracking-wide text-amber-700 font-semibold">
            Easy Travel Team
          </span>
        </div>

        <h2 className="font-bold text-3xl sm:text-5xl text-gray-900">
          Our Member
        </h2>
        <div className="w-24 h-1 bg-amber-500 mx-auto mt-3 rounded-full" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mt-10 sm:mt-16 justify-items-center">
          {members.map((m, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl w-full max-w-[360px]
                         shadow-[0_12px_28px_rgba(0,0,0,0.07)] border border-gray-100
                         transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] overflow-hidden"
            >
              <div className="relative pt-10 pb-6 bg-gradient-to-br from-amber-50 to-amber-100">
                <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-30 bg-amber-300" />
                <div className="relative w-36 sm:w-40 h-36 sm:h-40 mx-auto rounded-full p-[6px] bg-gradient-to-br from-amber-400 to-amber-600">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="w-full h-full rounded-full object-cover border-4 border-white
                               transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="py-6 px-6">
                <h3 className="font-semibold text-xl text-gray-900">
                  {m.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{m.role}</p>

                <div className="flex justify-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <i className="fa-brands fa-facebook text-amber-600 hover:text-amber-700 cursor-pointer" />
                  <i className="fa-brands fa-instagram text-amber-600 hover:text-amber-700 cursor-pointer" />
                  <i className="fa-brands fa-linkedin text-amber-600 hover:text-amber-700 cursor-pointer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

