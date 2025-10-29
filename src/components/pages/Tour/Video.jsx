import React from "react";

export default function BookingVideo() {
  return (
    <section className="w-full mt-20 flex flex-col items-center">
      {/* Tiêu đề */}
      <h2 className="text-4xl font-podcast text-center text-gray-900 mb-5 text-left w-[80%] max-w-6xl">
        Beautiful Vietnam
      </h2>

      {/* Khung video */}
      <div className="w-[80%] max-w-6xl aspect-video rounded-2xl overflow-hidden">
        <iframe
          className="w-full h-full rounded-2xl"
          src="https://www.youtube.com/embed/Sxhfof7Y8Gw?si=vkJ8YTX042xsjzVn" // 👉 Thay link video bạn muốn
          title="Beautiful Vietnam"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
}
