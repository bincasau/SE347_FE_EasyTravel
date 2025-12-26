import React, { useEffect, useState } from "react";
import BlogCard from "../components/pages/Blog/BlogCard";
import BlogSidebar from "../components/pages/Blog/BlogSiderbar";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [loading, setLoading] = useState(true);

  const blogsPerPage = 5;

  // ✅ S3 base for blog images
  const S3_BLOG_BASE =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";

  const getBlogImage = (blogId) => `${S3_BLOG_BASE}/blog_${blogId}.jpg`;

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
        `http://localhost:8080/blogs?page=${page - 1}&size=${blogsPerPage}`
      );
      if (!res.ok) throw new Error("Không thể tải danh sách blog");

      const data = await res.json();
      const items = data._embedded?.blogs || [];

      const formatted = items.map((b, index) => ({
        id: b.blogId || index,
        title: b.title,
        date: new Date(b.createdAt).toLocaleDateString("vi-VN"),
        description:
          (b.details?.slice(0, 200) || "") + (b.details?.length > 200 ? "..." : "") ||
          "Không mo ta",
        // ✅ đổi sang AWS S3
        image: getBlogImage(b.blogId),
        createdAt: b.createdAt,
      }));

      setBlogs(formatted);
      setFilteredBlogs(formatted);
      setTotalPages(data.page?.totalPages || 1);
    } catch (err) {
      console.error("❌ Lỗi fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load mặc định theo page
  useEffect(() => {
    if (debouncedSearch !== "" || filterDate !== "") return;
    fetchBlogs(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  /* ----------------------------------------------
   *  SEARCH + FILTER DATE COMBO API
   * ---------------------------------------------- */
  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        setLoading(true);

        let url = "";

        if (debouncedSearch.trim() !== "" && filterDate !== "") {
          url = `http://localhost:8080/blogs/search/findByTitleContainingIgnoreCaseAndCreatedAtGreaterThanEqual?keyword=${debouncedSearch}&startDate=${filterDate}&sort=createdAt,asc`;
        } else if (debouncedSearch.trim() !== "") {
          url = `http://localhost:8080/blogs/search/findByTitleContainingIgnoreCase?keyword=${debouncedSearch}`;
        } else if (filterDate !== "") {
          url = `http://localhost:8080/blogs/search/findByCreatedAtGreaterThanEqual?startDate=${filterDate}`;
        } else {
          fetchBlogs(1);
          return;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error filtering data");

        const data = await res.json();
        const items = data._embedded?.blogs || [];

        const formatted = items.map((b) => ({
          id: b.blogId,
          title: b.title,
          date: new Date(b.createdAt).toLocaleDateString("vi-VN"),
          description:
            (b.details?.slice(0, 200) || "") + (b.details?.length > 200 ? "..." : "") ||
            "Không có mô tả.",
          // ✅ đổi sang AWS S3
          image: getBlogImage(b.blogId),
          createdAt: b.createdAt,
        }));

        setFilteredBlogs(formatted);
        setTotalPages(1);
        setCurrentPage(1);
      } catch (err) {
        console.error("❌ Filter error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterDate]);

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

  return (
    <div className="max-w-[1150px] mx-auto px-[70px] py-12 lg:flex gap-8">
      {/* LEFT: LIST */}
      <div className="lg:w-[68%] w-full">
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
        {debouncedSearch === "" && filterDate === "" && totalPages > 1 && (
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
        onTagSelect={() => {}}
        onDateFilter={setFilterDate}
      />
    </div>
  );
}
