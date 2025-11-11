import React from "react";
import { FiSearch } from "react-icons/fi";

export default function BlogSidebar({ blogs = [], onSearch }) {
  const recentPosts = blogs.slice(0, 3);
  const gallery = blogs.slice(0, 6).map((b) => b.image);

  return (
    <aside className="lg:w-[30%] w-full lg:pl-8 space-y-6 sticky top-20 self-start">
      {/* 🔍 Search Box */}
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

      {/* 📰 Recent Posts */}
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

      {/* 🖼 Gallery */}
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
