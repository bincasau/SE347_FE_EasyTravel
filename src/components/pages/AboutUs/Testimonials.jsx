import "@fortawesome/fontawesome-free/css/all.min.css";
import { useEffect, useMemo, useState } from "react";

import alex1 from "../../../assets/images/AboutUs/alex.png";
import alex2 from "../../../assets/images/AboutUs/alex2.png";
import alex3 from "../../../assets/images/AboutUs/alex3.png";
import alex4 from "../../../assets/images/AboutUs/alex4.png";

export default function Testimonials() {
  const testimonials = [
    { name: "Alibaba Smith", avatar: alex1, text: "But I must explain to you how all this mistaken idea..." },
    { name: "Elizabeth Johnson", avatar: alex2, text: "No one rejects, dislikes, or avoids pleasure itself..." },
    { name: "Kaka Williams", avatar: alex3, text: "Everyone is entitled to pursue memorable journeys..." },
    { name: "Lyod Gomez", avatar: alex4, text: "Travel with confidence! Our guides and services..." },
  ];

  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)"); // sm
    const apply = () => setPerView(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const prev = () =>
    setIndex((i) => (i - perView + testimonials.length) % testimonials.length);
  const next = () => setIndex((i) => (i + perView) % testimonials.length);

  const visible = useMemo(
    () =>
      Array.from({ length: perView }).map(
        (_, off) => testimonials[(index + off) % testimonials.length]
      ),
    [index, perView, testimonials]
  );

  return (
    <section className="w-full py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-poppins font-semibold text-xl sm:text-3xl">
            Happy Customers Says
          </h2>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition"
              aria-label="Previous"
            >
              <i className="fa-solid fa-angle-left" />
            </button>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition"
              aria-label="Next"
            >
              <i className="fa-solid fa-angle-right" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {visible.map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} {...t} />
          ))}
        </div>

        <div className="mt-6 flex sm:hidden justify-center gap-3">
          <button
            onClick={prev}
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-200 transition"
          >
            <i className="fa-solid fa-angle-left" />
          </button>
          <button
            onClick={next}
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-amber-500 hover:bg-amber-500 hover:text-white transition"
          >
            <i className="fa-solid fa-angle-right" />
          </button>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, avatar, text }) {
  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm p-5 sm:p-7">
      <i className="fa-solid fa-quote-left text-amber-200 text-2xl absolute top-5 left-6" />
      <i className="fa-solid fa-quote-right text-amber-200 text-2xl absolute bottom-5 right-6" />

      <div className="flex flex-col items-center">
        <img
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow mb-2"
        />
        <div className="font-poppins text-gray-700 text-sm">{name}</div>
      </div>

      <p className="mt-4 text-[13.5px] leading-6 text-gray-600">{text}</p>
    </div>
  );
}
