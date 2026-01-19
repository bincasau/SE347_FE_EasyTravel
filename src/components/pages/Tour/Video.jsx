import React from "react";

export default function BookingVideo() {
  return (
    <section className="w-full mt-12 sm:mt-16 lg:mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5">
          Beautiful Vietnam
        </h2>

        {/* Video */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/Sxhfof7Y8Gw?si=vkJ8YTX042xsjzVn"
            title="Beautiful Vietnam"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
