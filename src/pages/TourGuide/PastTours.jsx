import React from "react";

const tours = [
  {
    id: 1,
    title: "Lucca Bike Tour",
    image: "https://images.unsplash.com/photo-1600359753839-ed4f6a9bd86c",
    date: "Tuesday, 02 Oct 2022",
    time: "15:00 PM",
    group: "15-30",
    transportation: "Bus",
    duration: "15 hours and 45 minutes",
    guideService: "Included",
    language: "English, Italian",
    entryFees: "lorem ipsum"
  },
  {
    id: 2,
    title: "Lucca Bike Tour",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    date: "Tuesday, 02 Oct 2022",
    time: "15:00 PM",
    group: "15-30",
    transportation: "Bus",
    duration: "15 hours and 45 minutes",
    guideService: "Included",
    language: "English, Italian",
    entryFees: "lorem ipsum"
  },
  {
    id: 3,
    title: "Lucca Bike Tour",
    image: "https://images.unsplash.com/photo-1479057000319-7f6a6d7cd3a5",
    date: "Tuesday, 02 Oct 2022",
    time: "15:00 PM",
    group: "15-30",
    transportation: "Bus",
    duration: "15 hours and 45 minutes",
    guideService: "Included",
    language: "English, Italian",
    entryFees: "lorem ipsum"
  },
];

export default function PastTours() {
  return (
    <div className="w-full py-12 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold mb-10">Past Tours</h2>

      <div className="flex flex-col gap-8">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="flex flex-col md:flex-row bg-white rounded-xl shadow-md overflow-hidden p-4"
          >
            {/* Image */}
            <div className="w-full md:w-1/3">
              <img
                src={tour.image}
                alt={tour.title}
                className="w-full h-60 md:h-full object-cover rounded-lg"
              />
            </div>

            {/* Content */}
            <div className="w-full md:w-2/3 flex flex-col justify-between px-6 py-4">
              <h3 className="text-2xl font-semibold mb-4">{tour.title}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-gray-700 text-sm">

                <p>📅 <strong>Date:</strong> {tour.date}</p>
                <p>⏳ <strong>Duration:</strong> {tour.duration}</p>

                <p>⏰ <strong>Time:</strong> {tour.time}</p>
                <p>🧑‍🏫 <strong>Guide service:</strong> {tour.guideService}</p>

                <p>👥 <strong>Number of group:</strong> {tour.group}</p>
                <p>🌐 <strong>Language:</strong> {tour.language}</p>

                <p>🚌 <strong>Transportation:</strong> {tour.transportation}</p>
                <p>🎫 <strong>Entry Fees:</strong> {tour.entryFees}</p>
              </div>

              {/* Button */}
              <div className="mt-6">
                <button className="px-5 py-2 border border-orange-400 text-orange-500 rounded-full hover:bg-orange-100 transition">
                  View tour
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
