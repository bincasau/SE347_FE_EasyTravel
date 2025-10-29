import React from "react";
import {
  FaUsers,
  FaClock,
  FaMapMarkerAlt,
  FaUserTie,
  FaLanguage,
  FaTicketAlt,
  FaBus,
} from "react-icons/fa";

export default function TourDetailsInfo() {
  return (
    <section className="max-w-6xl mx-auto px-6 mt-20">
      {/* Tiêu đề */}
      <h2 className="text-4xl font-podcast text-gray-800 mb-4">Details</h2>

      {/* Mô tả */}
      <p className="text-gray-600 leading-relaxed mb-6 max-w-[60%]">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        Lorem Ipsum has been the industry's standard dummy text ever since the
        1500s, when an unknown printer took a galley of type and scrambled it to
        make a type specimen book. It has survived not only five centuries, but
        also the leap into electronic typesetting, remaining essentially
        unchanged. It was popularised in the 1960s with the release of Letraset
        sheets containing Lorem Ipsum passages, and more recently with desktop
        publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      </p>

      {/* Danh sách thông tin */}
      <ul className="space-y-3 text-gray-700">
        <li className="flex items-center gap-3">
          <FaUsers className="text-orange-500 text-lg" />
          <span>
            <strong>Number of group:</strong> 15–30
          </span>
        </li>
        <li className="flex items-center gap-3">
          <FaClock className="text-orange-500 text-lg" />
          <span>
            <strong>Duration:</strong> 15 hours and 45 minutes
          </span>
        </li>
        <li className="flex items-center gap-3">
          <FaMapMarkerAlt className="text-orange-500 text-lg" />
          <span>
            <strong>Departuring and arriving areas:</strong> Lucca
          </span>
        </li>
        <li className="flex items-center gap-3">
          <FaUserTie className="text-orange-500 text-lg" />
          <span>
            <strong>Guide service:</strong> Included
          </span>
        </li>
        <li className="flex items-center gap-3">
          <FaLanguage className="text-orange-500 text-lg" />
          <span>
            <strong>Language:</strong> English, Italian
          </span>
        </li>
        <li className="flex items-center gap-3">
          <FaTicketAlt className="text-orange-500 text-lg" />
          <span>
            <strong>Entry Fees:</strong> Lorem Ipsum
          </span>
        </li>
        <li className="flex items-center gap-3">
          <FaBus className="text-orange-500 text-lg" />
          <span>
            <strong>Transportation:</strong> Bus
          </span>
        </li>
      </ul>
    </section>
  );
}
