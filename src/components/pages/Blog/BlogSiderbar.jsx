import React, { useEffect, useMemo, useRef, useState } from "react";
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

/* =========================
   Date helpers (Tour-like)
========================= */
// yyyy-mm-dd -> dd/mm/yyyy
const ymdToDMY = (ymd) => {
  if (!ymd) return "";
  const [y, m, d] = String(ymd).split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
};

// dd/mm/yyyy -> yyyy-mm-dd ("" nếu invalid)
const dmyToYMD = (dmy) => {
  if (!dmy) return "";
  const s = String(dmy).trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);

  if (mm < 1 || mm > 12) return "";
  if (dd < 1 || dd > 31) return "";

  const dt = new Date(yyyy, mm - 1, dd);
  if (
    dt.getFullYear() !== yyyy ||
    dt.getMonth() !== mm - 1 ||
    dt.getDate() !== dd
  )
    return "";

  const y = String(yyyy).padStart(4, "0");
  const mo = String(mm).padStart(2, "0");
  const da = String(dd).padStart(2, "0");
  return `${y}-${mo}-${da}`;
};

// auto format: chỉ cho nhập số, tự chèn "/" theo dd/mm/yyyy
const formatDMYInput = (value) => {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8); // ddmmyyyy
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  let out = d;
  if (digits.length >= 3) out += "/" + m;
  if (digits.length >= 5) out += "/" + y;
  return out;
};

// Date -> yyyy-mm-dd
const dateObjToYMD = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function BlogSidebar({
  blogs = [],
  onSearch,
  onTagSelect,
  onDateFilter,
}) {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);

  // ✅ date filter: committed = yyyy-mm-dd (gửi ra ngoài)
  const [filterYMD, setFilterYMD] = useState("");
  // ✅ input hiển thị dd/mm/yyyy
  const [draftDMY, setDraftDMY] = useState("");
  const [dateError, setDateError] = useState("");

  // ✅ react-datepicker needs Date | null
  const [pickerDate, setPickerDate] = useState(null);

  const dpRef = useRef(null);

  useEffect(() => {
    fetch(`${BASE_URL}/blogs/tags`)
      .then((res) => res.json())
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading tags:", err));
  }, []);

  const uiBlogs = useMemo(() => blogs.map(mapBlog), [blogs]);
  const recentPosts = uiBlogs.slice(0, 3);
  const gallery = uiBlogs.slice(0, 6);

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

  // ✅ apply input dd/mm/yyyy -> commit yyyy-mm-dd
  const applyDraftDate = () => {
    const trimmed = String(draftDMY || "").trim();

    // empty => clear
    if (!trimmed) {
      setFilterYMD("");
      setDraftDMY("");
      setPickerDate(null);
      setDateError("");
      onDateFilter?.("");
      return;
    }

    const ymd = dmyToYMD(trimmed);
    if (!ymd) {
      setDateError("Ngày không hợp lệ. Nhập đúng dd/mm/yyyy.");
      return;
    }

    setFilterYMD(ymd);
    setDraftDMY(ymdToDMY(ymd));
    setPickerDate(new Date(ymd));
    setDateError("");
    onDateFilter?.(ymd);
  };

  const clearDate = () => {
    setFilterYMD("");
    setDraftDMY("");
    setPickerDate(null);
    setDateError("");
    onDateFilter?.("");
  };

  return (
    <>
      {/* ✅ CSS INLINE: ngoài tháng màu xám (vẫn click/nhảy tháng bình thường) */}
      <style>{`
        .blog-datepicker .react-datepicker__day--outside-month{
          color:#9ca3af !important;
          opacity:0.75;
        }
        .blog-datepicker .react-datepicker__day--outside-month:hover{
          background: rgba(156,163,175,0.12) !important;
        }
      `}</style>

      {/* ✅ sticky theo scroll */}
      <aside className="w-full space-y-6 self-start lg:sticky lg:top-6">
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

          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/yyyy"
              value={draftDMY}
              onChange={(e) => {
                setDraftDMY(formatDMYInput(e.target.value));
                setDateError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyDraftDate();
              }}
              className="w-full border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <button
              type="button"
              onClick={() => dpRef.current?.setOpen?.(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-md hover:bg-gray-100"
              aria-label="Open calendar"
            >
              <FaCalendarAlt className="text-gray-500" />
            </button>

            <div className="absolute left-0 top-full">
              <DatePicker
                ref={dpRef}
                selected={pickerDate}
                onChange={(date) => {
                  if (!date) return;
                  setPickerDate(date);

                  const ymd = dateObjToYMD(date);
                  setFilterYMD(ymd);
                  setDraftDMY(ymdToDMY(ymd));
                  setDateError("");
                  onDateFilter?.(ymd);
                }}
                dateFormat="yyyy-MM-dd"
                inline={false}
                popperClassName="z-[99999]"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                customInput={<span />}
                calendarClassName="blog-datepicker"
              />
            </div>
          </div>

          {dateError && (
            <div className="mt-2 text-sm text-red-600">{dateError}</div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={applyDraftDate}
              className="py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-semibold"
            >
              Apply
            </button>

            <button
              onClick={clearDate}
              className="py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
              disabled={!filterYMD && !draftDMY}
            >
              Clear
            </button>
          </div>
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
    </>
  );
}
