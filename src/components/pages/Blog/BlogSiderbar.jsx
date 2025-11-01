import React from "react";
import { FiSearch } from "react-icons/fi";

// ✅ Import đầy đủ ảnh Blog1 → Blog10
import Blog1 from "../../../assets/images/Blog/blog1.jpg";
import Blog2 from "../../../assets/images/Blog/blog2.jpg";
import Blog3 from "../../../assets/images/Blog/blog3.jpg";
import Blog4 from "../../../assets/images/Blog/blog4.jpg";
import Blog5 from "../../../assets/images/Blog/blog5.jpg";
import Blog6 from "../../../assets/images/Blog/blog6.jpg";
import Blog7 from "../../../assets/images/Blog/blog7.jpg";
import Blog8 from "../../../assets/images/Blog/blog8.jpg";
import Blog9 from "../../../assets/images/Blog/blog9.jpg";
import Blog10 from "../../../assets/images/Blog/blog10.jpg";

const BlogSidebar = () => {
  const recentPosts = [
    { image: Blog8, title: "Discovering the charm of small towns in Italy", date: "July 29, 2023" },
    { image: Blog9, title: "Why mountain hiking boosts mental health", date: "August 1, 2023" },
    { image: Blog10, title: "Packing smart: Travel light without missing essentials", date: "August 3, 2023" },
  ];

  const gallery = [Blog1, Blog2, Blog3, Blog4, Blog5, Blog6, Blog7, Blog8, Blog9];

  return (
    <aside className="lg:w-[30%] w-full lg:pl-8 space-y-6 sticky top-20 self-start">
      {/* Search */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-3 text-gray-800">Search</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Type anything..."
            className="w-full border border-gray-200 rounded-lg py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute right-3 top-2.5 text-gray-400 text-lg" />
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-3 text-gray-800">Recent Posts</h3>
        <ul className="space-y-3">
          {recentPosts.map((post, i) => (
            <li
              key={i}
              className="flex gap-3 items-center hover:bg-gray-50 p-2 rounded-lg transition"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">{post.date} • Admin</p>
                <p className="text-sm font-medium text-gray-700 hover:text-blue-500 cursor-pointer leading-tight">
                  {post.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-3 text-gray-800">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Activity",
            "City",
            "Tour",
            "Museums",
            "Sports",
            "Cooking",
            "Luxury",
            "Mountain",
          ].map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs md:text-sm rounded-lg hover:bg-blue-100 cursor-pointer transition"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
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
};

export default BlogSidebar;
