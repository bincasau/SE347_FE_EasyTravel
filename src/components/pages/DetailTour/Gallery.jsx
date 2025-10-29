import React, { useState } from "react";
import imgMain from "../../../assets/images/Tour/travel1.jpg";
import img2    from "../../../assets/images/Tour/travel2.jpg";
import img3    from "../../../assets/images/Tour/travel3.jpg";
import img4    from "../../../assets/images/Tour/travel4.jpg";
import img5    from "../../../assets/images/Tour/travel5.jpg";
import img6    from "../../../assets/images/Tour/travel6.jpg";
import img7    from "../../../assets/images/Tour/travel7.jpg";
import img8    from "../../../assets/images/Tour/travel8.jpg";
import img9    from "../../../assets/images/Tour/travel9.jpg";
import img10   from "../../../assets/images/Tour/travel9.jpg";

export default function TourGallery() {
  // mỗi “set” gồm 1 ảnh lớn + 2 ảnh nhỏ bên phải
  const gallerySets = [
    { big: imgMain, smallTop: img2,  smallBottom: img3  },
    { big: img4,    smallTop: img5,  smallBottom: img6  },
    { big: img7,    smallTop: img8,  smallBottom: img9  },
    { big: img10,   smallTop: img2,  smallBottom: img3  },
  ];

  const [index, setIndex] = useState(0);
  const atStart = index === 0;
  const atEnd   = index === gallerySets.length - 1;

  const next = () => {
    if (!atEnd) setIndex((i) => i + 1); // không vòng lặp
  };
  const prev = () => {
    if (!atStart) setIndex((i) => i - 1);
  };

  const current = gallerySets[index];

  return (
    <section className="max-w-6xl mx-auto px-6 mt-20">
      {/* Header + nav */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-podcast text-gray-800">Gallery</h2>

        <div className="flex gap-3">
          {/* Nút trái */}
          <button
            onClick={prev}
            disabled={atStart}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition
              ${atStart
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white"}`}
            aria-label="Previous"
          >
            ←
          </button>

          {/* Nút phải */}
          <button
            onClick={next}
            disabled={atEnd}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition
              ${atEnd
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white"}`}
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>

      {/* Layout 1 lớn + 2 nhỏ dọc */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Ảnh lớn */}
        <img
          src={current.big}
          alt="Gallery large"
          className="w-full md:w-2/3 h-[400px] object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
        />

        {/* 2 ảnh nhỏ bên phải */}
        <div className="flex flex-col gap-4 w-full md:w-1/3">
          <img
            src={current.smallTop}
            alt="Gallery small top"
            className="h-[195px] object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
          />
          <img
            src={current.smallBottom}
            alt="Gallery small bottom"
            className="h-[195px] object-cover rounded-2xl shadow-md hover:scale-[1.01] transition"
          />
        </div>
      </div>
    </section>
  );
}
