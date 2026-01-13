import React, { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { buildTourSlug } from "@/utils/slug";

const BASE_URL = "http://localhost:8080";

const mapBlog = (b) => {
  const id = b.blogId ?? b.id;
  const dateISO = b.createdAt ?? b.time ?? b.date;
  const date = dateISO ? String(dateISO).slice(0, 10) : "";
  const title = b.title ?? "";
  const description = (b.details ?? b.description ?? "").slice(0, 180);

  const image =
    b.thumbnail?.startsWith("http")
      ? b.thumbnail
      : b.thumbnail
      ? `${BASE_URL}/uploads/${b.thumbnail}`
      : b.image ?? "";

  return { id, image, date, title, description, raw: b };
};

export default function BlogSidebar({
  blogs = [],
  onSearch,
  onTagSelect,
  onDateFilter,
}) {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/blogs/tags`)
      .then((res) => res.json())
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading tags:", err));
  }, []);

  const uiBlogs = useMemo(() => blogs.map(mapBlog), [blogs]);
  const recentPosts = uiBlogs.slice(0, 3);
  const gallery = uiBlogs.slice(0, 6);

  const formatToYMD = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const goDetail = (post) => {
    if (!post?.id) return;
    const slugId = buildTourSlug(post.id, post.title);
    navigate(`/detailblog/${slugId}`, {
      state: {
        id: post.id,
        image: post.image,
        date: post.date,
        title: post.title,
        description: post.description,
      },
    });
  };

  return (
    <aside className="w-full space-y-6 self-start">
      {/* 🔍 SEARCH BOX */}
      <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-semibold mb-3 text-gray-800">Search</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search blog..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full border border-gray-200 rounded-lg py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <FiSearch className="absolute right-3 top-2.5 text-gray-400 text-lg" />
        </div>
      </div>

      {/* 🗓 DATE FILTER BOX */}
      <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-semibold mb-3 text-gray-800">Filter by Date</h3>

        <div className="relative flex items-center">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              onDateFilter?.(formatToYMD(date));
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select date"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            popperClassName="z-[99999]"
            popperPlacement="bottom-start"
            showPopperArrow={false}
          />
          <FaCalendarAlt className="absolute right-3 text-gray-500 pointer-events-none" />
        </div>

        {selectedDate && (
          <button
            onClick={() => {
              setSelectedDate(null);
              onDateFilter?.("");
            }}
            className="mt-3 w-full py-1.5 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* 🏷 TAG FILTER */}
      <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-semibold mb-3 text-gray-800">Tags</h3>

        <div className="flex flex-wrap gap-2">
          {tags.length === 0 && (
            <p className="text-sm text-gray-400">No tags found...</p>
          )}

          {tags.map((tag, i) => (
            <button
              key={i}
              onClick={() => onTagSelect?.(tag)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-orange-500 hover:text-white transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 📰 RECENT POSTS */}
      <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-semibold mb-3 text-gray-800">Recent Posts</h3>
        <ul className="space-y-3">
          {recentPosts.map((post) => (
            <li
              key={post.id}
              onClick={() => goDetail(post)}
              className="flex gap-3 items-center hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer"
            >
              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{post.date} • Admin</p>
                <p className="text-sm font-medium text-gray-700 hover:text-orange-500 leading-tight line-clamp-2">
                  {post.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 🖼 GALLERY */}
      <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <h3 className="font-semibold mb-3 text-gray-800">Gallery</h3>
        <div className="grid grid-cols-3 gap-2">
          {gallery.map((post, i) => (
            <button
              key={`${post.id}-${i}`}
              onClick={() => goDetail(post)}
              className="w-full aspect-square bg-gray-200 rounded-md overflow-hidden"
              type="button"
            >
              {post.image ? (
                <img
                  src={post.image}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
