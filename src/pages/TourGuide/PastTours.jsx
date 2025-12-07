import { useState } from "react";
import { Link } from "react-router-dom";

const toursData = [
  {
    id: 1,
    title: "Lucca Bike Tour",
    image: "https://images.unsplash.com/photo-1600359753839-ed4f6a9bd86c",
    date: "2022-10-02",
    duration: "15h 45m",
  },
  {
    id: 2,
    title: "City Walking Tour",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    date: "2022-10-05",
    duration: "8h 20m",
  },
  {
    id: 3,
    title: "Wine Tasting Tour",
    image: "https://images.unsplash.com/photo-1479057000319-7f6a6d7cd3a5",
    date: "2022-10-10",
    duration: "6h 40m",
  },
];

export default function PastTours() {
  const [sortOrder, setSortOrder] = useState("newest");

  // Sort theo ngày
  const sortedTours = [...toursData].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  return (
    <div className="w-full py-10 max-w-6xl mx-auto px-4">

      {/* ⭐ TITLE ĐẸP NHƯ GUIDE PROFILE */}
      <h2 className="text-3xl font-bold text-center text-orange-500 mb-12">
        Past Tours
      </h2>

      {/* SORT CONTROLS */}
      <div className="flex justify-end mb-6">
        <select
          className="border rounded-full px-4 py-2 text-sm cursor-pointer shadow-sm"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Gần nhất → Xa nhất</option>
          <option value="oldest">Xa nhất → Gần nhất</option>
        </select>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-6">
        {sortedTours.map((tour) => (
          <div
            key={tour.id}
            className="bg-white shadow rounded-xl p-4 flex items-center gap-6 hover:shadow-lg transition"
          >
            {/* IMAGE */}
            <img
              src={tour.image}
              alt={tour.title}
              className="w-40 h-32 rounded-lg object-cover flex-shrink-0"
            />

            {/* INFO */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">
                {tour.title}
              </h3>

              <div className="mt-2 text-gray-600 text-sm">
                <p>📅 <strong>Date:</strong> {new Date(tour.date).toDateString()}</p>
                <p>⏳ <strong>Duration:</strong> {tour.duration}</p>
              </div>
            </div>

            {/* BUTTON */}
            <Link
              to={`/guide/tour/${tour.id}/schedule`}
              className="px-5 py-2 border border-orange-400 text-orange-500 rounded-full hover:bg-orange-100 transition"
            >
              View Tour
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
