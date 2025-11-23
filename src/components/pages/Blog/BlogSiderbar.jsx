import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BlogSidebar({ blogs = [], onSearch, onTagSelect, onDateFilter }) {
  const [tags, setTags] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch TAGS from API
  useEffect(() => {
    fetch("http://localhost:8080/blogs/tags")
      .then((res) => res.json())
      .then((data) => setTags(data))
      .catch((err) => console.error("Error loading tags:", err));
  }, []);

  const recentPosts = blogs.slice(0, 3);
  const gallery = blogs.slice(0, 6).map((b) => b.image);

  /** Chuyển Date → yyyy-mm-dd */
  const formatToYMD = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <aside className="lg:w-[30%] w-full lg:pl-8 space-y-6 sticky top-20 self-start">

      {/* 🔍 SEARCH BOX */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-semibold mb-3 text-gray-800">Search</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search blog..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <FiSearch className="absolute right-3 top-2.5 text-gray-400 text-lg" />
        </div>
      </div>

      {/* 🗓 DATE FILTER BOX */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition z-50">
        <h3 className="font-semibold mb-3 text-gray-800">Filter by Date</h3>

        <div className="relative flex items-center">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              onDateFilter(formatToYMD(date));
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select date"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            popperClassName="z-[9999]"      // FIX POPUP
            popperPlacement="bottom-start"  // Position
            showPopperArrow={false}
          />
          <FaCalendarAlt className="absolute right-3 text-gray-500 pointer-events-none" />
        </div>

        {selectedDate && (
          <button
            onClick={() => {
              setSelectedDate(null);
              onDateFilter("");
            }}
            className="mt-3 w-full py-1.5 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* 🏷 TAG FILTER */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-semibold mb-3 text-gray-800">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 && (
            <p className="text-sm text-gray-400">No tags found...</p>
          )}

          {tags.map((tag, i) => (
            <button
              key={i}
              onClick={() => onTagSelect(tag)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-orange-500 hover:text-white transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 📰 RECENT POSTS */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-semibold mb-3 text-gray-800">Recent Posts</h3>
        <ul className="space-y-3">
          {recentPosts.map((post, i) => (
            <li
              key={i}
              className="flex gap-3 items-center hover:bg-gray-50 p-2 rounded-lg transition"
            >
              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">{post.date} • Admin</p>
                <p className="text-sm font-medium text-gray-700 hover:text-orange-500 cursor-pointer leading-tight">
                  {post.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 🖼 GALLERY */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-semibold mb-3 text-gray-800">Gallery</h3>
        <div className="grid grid-cols-3 gap-2">
          {gallery.map((img, i) => (
            <div
              key={i}
              className="w-full aspect-square bg-gray-200 rounded-md overflow-hidden"
            >
              <img
                src={img}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
