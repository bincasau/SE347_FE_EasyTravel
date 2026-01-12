import React, { useEffect, useMemo, useState } from "react";
import BlogCard from "../components/pages/Blog/BlogCard";
import BlogSidebar from "../components/pages/Blog/BlogSiderbar";

export default function Blog() {
  const [blogs, setBlogs] = useState([]); // list gốc (dùng cho sidebar recent/gallery)
  const [filteredBlogs, setFilteredBlogs] = useState([]); // list hiển thị bên trái

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [selectedTag, setSelectedTag] = useState(""); // ✅ tag đang chọn
  const [loading, setLoading] = useState(true);

  const blogsPerPage = 5;

  const BASE_URL = "http://localhost:8080";

  // ✅ S3 base for blog images
  const S3_BLOG_BASE =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";

  const getBlogImage = (blogId) => `${S3_BLOG_BASE}/blog_${blogId}.jpg`;

  // ✅ format desc
  const toDesc = (details) => {
    const text = details || "";
    if (!text) return "Không có mô tả.";
    return text.slice(0, 200) + (text.length > 200 ? "..." : "");
  };

  // ✅ Map API blog -> UI blog card
  const mapBlog = (b, fallbackIndex = 0) => ({
    id: b.blogId ?? b.id ?? fallbackIndex,
    title: b.title ?? "",
    date: b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN") : "",
    description: toDesc(b.details),
    image: getBlogImage(b.blogId ?? b.id ?? fallbackIndex),
    createdAt: b.createdAt ?? null,
  });

  /* ----------------------------------------------
   *  DEBOUNCE SEARCH (0.7s)
   * ---------------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 700);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ----------------------------------------------
   *  FETCH BLOG DEFAULT (PAGED)
   * ---------------------------------------------- */
  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/blogs?page=${page - 1}&size=${blogsPerPage}`
      );
      if (!res.ok) throw new Error("Không thể tải danh sách blog");

      const data = await res.json();
      const items = data._embedded?.blogs || [];

      const formatted = items.map((b, index) => mapBlog(b, index));

      // blogs: dùng cho sidebar recent/gallery
      setBlogs(formatted);

      // nếu không có filter nào thì list hiển thị = default page
      setFilteredBlogs(formatted);

      setTotalPages(data.page?.totalPages || 1);
    } catch (err) {
      console.error("❌ Lỗi fetch blogs:", err);
      setBlogs([]);
      setFilteredBlogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Load mặc định theo page (chỉ khi KHÔNG có search/date/tag)
  useEffect(() => {
    if (debouncedSearch !== "" || filterDate !== "" || selectedTag !== "") return;
    fetchBlogs(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, filterDate, selectedTag]);

  /* ----------------------------------------------
   *  SEARCH + FILTER DATE COMBO API
   *  (chỉ chạy khi không chọn TAG)
   * ---------------------------------------------- */
  useEffect(() => {
    const fetchFiltered = async () => {
      // nếu đang lọc TAG thì không chạy search/date combo ở đây
      if (selectedTag) return;

      try {
        setLoading(true);

        let url = "";

        if (debouncedSearch.trim() !== "" && filterDate !== "") {
          url = `${BASE_URL}/blogs/search/findByTitleContainingIgnoreCaseAndCreatedAtGreaterThanEqual?keyword=${encodeURIComponent(
            debouncedSearch
          )}&startDate=${encodeURIComponent(filterDate)}&sort=createdAt,asc`;
        } else if (debouncedSearch.trim() !== "") {
          url = `${BASE_URL}/blogs/search/findByTitleContainingIgnoreCase?keyword=${encodeURIComponent(
            debouncedSearch
          )}`;
        } else if (filterDate !== "") {
          url = `${BASE_URL}/blogs/search/findByCreatedAtGreaterThanEqual?startDate=${encodeURIComponent(
            filterDate
          )}`;
        } else {
          // không filter gì => về default list page 1
          setCurrentPage(1);
          fetchBlogs(1);
          return;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error filtering data");

        const data = await res.json();
        const items = data._embedded?.blogs || [];

        const formatted = items.map((b, index) => mapBlog(b, index));

        // với search/date: list bên trái thay đổi
        setFilteredBlogs(formatted);

        // sidebar recent/gallery nên lấy theo data đang hiển thị cũng ok
        setBlogs(formatted);

        setTotalPages(1);
        setCurrentPage(1);
      } catch (err) {
        console.error("❌ Filter error:", err);
        setFilteredBlogs([]);
        setBlogs([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterDate, selectedTag]);

  /* ----------------------------------------------
   *  FILTER BY TAG API
   * ---------------------------------------------- */
  const fetchByTag = async (tag) => {
    try {
      setLoading(true);

      const url = `${BASE_URL}/blogs/search/findByTagContainingIgnoreCase?tag=${encodeURIComponent(
        tag
      )}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error filter by tag");

      const data = await res.json();
      const items = data._embedded?.blogs || [];

      const formatted = items.map((b, index) => mapBlog(b, index));

      setSelectedTag(tag);

      // tag filter: update list bên trái
      setFilteredBlogs(formatted);

      // sidebar recent/gallery theo list này cho hợp lý
      setBlogs(formatted);

      // tag filter => không pagination
      setTotalPages(1);
      setCurrentPage(1);

      // clear các filter khác để tránh “đánh nhau”
      setSearchTerm("");
      setDebouncedSearch("");
      setFilterDate("");
    } catch (err) {
      console.error("❌ Tag filter error:", err);
      setFilteredBlogs([]);
      setBlogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tag) => {
    if (!tag) return;
    fetchByTag(tag);
  };

  const clearTag = () => {
    setSelectedTag("");
    setCurrentPage(1);
    // quay lại default list
    fetchBlogs(1);
  };

  /* ----------------------------------------------
   *  PAGINATION SLIDE (kiểu Tour)
   * ---------------------------------------------- */
  const getVisiblePages = () => {
    let pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage === 1) return [1, 2, 3];
    if (currentPage === 2) return [1, 2, 3, 4];
    if (currentPage === 3) return [1, 2, 3, 4, 5];

    if (currentPage === totalPages)
      return [totalPages - 2, totalPages - 1, totalPages];

    if (currentPage === totalPages - 1)
      return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];

    if (currentPage === totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    let start = currentPage - 2;
    let end = currentPage + 2;

    if (start < 1) start = 1;
    if (end > totalPages) end = totalPages;

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const showPagination =
    debouncedSearch === "" && filterDate === "" && selectedTag === "" && totalPages > 1;

  return (
    <div className="max-w-[1150px] mx-auto px-[70px] py-12 lg:flex gap-8">
      {/* LEFT: LIST */}
      <div className="lg:w-[68%] w-full">
        {/* Tag label */}
        {selectedTag && (
          <div className="mb-6 flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Filtered by tag: <b>{selectedTag}</b>
            </div>
            <button
              onClick={clearTag}
              className="text-orange-600 hover:underline text-sm"
            >
              Clear tag
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Đang tải bài viết...
          </div>
        ) : filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => <BlogCard key={blog.id} {...blog} />)
        ) : (
          <p className="text-gray-500 text-center py-8">
            Không tìm thấy bài viết nào.
          </p>
        )}

        {/* PAGINATION only for default listing */}
        {showPagination && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2 rounded-full text-sm font-semibold border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-orange-100"
              }`}
            >
              ‹ Prev
            </button>

            {/* Page numbers */}
            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  currentPage === page
                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-5 py-2 rounded-full text-sm font-semibold border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-orange-100"
              }`}
            >
              Next ›
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: SIDEBAR */}
      <BlogSidebar
        blogs={blogs}
        onSearch={setSearchTerm}
        onTagSelect={handleTagSelect}      // ✅ TAG FILTER
        onDateFilter={setFilterDate}
      />
    </div>
  );
}
