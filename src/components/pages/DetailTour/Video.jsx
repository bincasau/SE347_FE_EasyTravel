import React from "react";

export default function Video({ title, youtubeUrl }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12 mt-20">
      <h2 className="text-4xl font-podcast mb-6 text-gray-800">{title}</h2>
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md">
        <iframe
          width="100%"
          height="100%"
          src={youtubeUrl}
          title="Tour Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}
