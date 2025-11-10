import React from "react";
import {
  FaUsers,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMapSigns,
  FaDollarSign,
  FaTag,
} from "react-icons/fa";

export default function TourDetailsInfo() {
  return (
    <section className="max-w-6xl mx-auto px-6 mt-10">
      {/* Tiêu đề */}
      <h2 className="text-4xl font-podcast text-gray-800 mb-4">
        Lucca Bike Tour
      </h2>

      {/* Mô tả */}
      <p className="text-gray-600 leading-relaxed mb-6 max-w-[60%]">
        Explore the beauty of Lucca by bike with a local guide. Perfect for
        first-time visitors who love nature and culture.
      </p>

      {/* Danh sách thông tin */}
      <ul className="space-y-3 text-gray-700 text-sm">
        <li className="flex items-center gap-3">
          <FaMapSigns className="text-orange-500 text-lg" />
          <span>
            <strong>Departure location:</strong> Lucca Center
          </span>
        </li>

        <li className="flex items-center gap-3">
          <FaMapMarkerAlt className="text-orange-500 text-lg" />
          <span>
            <strong>Destination:</strong> Lucca, Italy
          </span>
        </li>

        <li className="flex items-center gap-3">
          <FaCalendarAlt className="text-orange-500 text-lg" />
          <span>
            <strong>Start Date:</strong> 2025-03-01 &nbsp;|&nbsp;
            <strong>End Date:</strong> 2025-03-01
          </span>
        </li>

        <li className="flex items-center gap-3">
          <FaClock className="text-orange-500 text-lg" />
          <span>
            <strong>Duration:</strong> 1 day
          </span>
        </li>

        <li className="flex items-center gap-3">
          <FaUsers className="text-orange-500 text-lg" />
          <span>
            <strong>Seats:</strong> Limit 15 &nbsp;|&nbsp; Available 10
          </span>
        </li>

        <li className="flex items-center gap-3">
          <FaDollarSign className="text-orange-500 text-lg" />
          <span>
            <strong>Adult Price:</strong> 34 € &nbsp;|&nbsp;
            <strong>Child Price:</strong> 25 €
          </span>
        </li>

        <li className="flex items-center gap-3">
          <FaTag className="text-orange-500 text-lg" />
          <span>
            <strong>Discount:</strong> -10%
          </span>
        </li>

        <li className="flex items-center gap-3">
          <FaCalendarAlt className="text-orange-500 text-lg" />
          <span>
            <strong>Status:</strong> Active
          </span>
        </li>

        <li className="flex items-center gap-3">
          <FaClock className="text-orange-500 text-lg" />
          <span>
            <strong>Created at:</strong> 2025-02-15
          </span>
        </li>
      </ul>
    </section>
  );
}
