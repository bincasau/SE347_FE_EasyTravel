import React, { useEffect, useState } from "react";
import BlogCard from "../components/pages/Blog/BlogCard";
import BlogSidebar from "../components/pages/Blog/BlogSiderbar";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const blogsPerPage = 5;

  // ✅ Fetch blog theo trang
  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8080/blogs?page=${page - 1}&size=${blogsPerPage}`
      );
      if (!res.ok) throw new Error("Không thể tải danh sách blog");
      const data = await res.json();

      const items = data._embedded
        ? data._embedded.blogs
        : Array.isArray(data)
        ? data
        : [];

      const formatted = items.map((b, index) => ({
        id: b.blogId || index,
        title: b.title,
        date: new Date(b.createdAt).toLocaleDateString("vi-VN"),
        description:
          b.details?.slice(0, 200) + (b.details?.length > 200 ? "..." : "") ||
          "Không có mô tả.",
        // ✅ Ảnh blog lấy theo thư mục /images/blog/blog_${id}_img_1.jpg
        image: `/images/blog/blog_${b.blogId}_img_1.jpg`,
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

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage]);

  // ✅ Search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBlogs(blogs);
      return;
    }

    const filtered = blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBlogs(filtered);
  }, [searchTerm, blogs]);

  // ✅ Pagination (3 nút hiển thị)
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 3;
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  <div className="lg:w-[68%] w-full">
    {loading ? (
      <div className="text-center py-10 text-gray-500 text-lg">
        Đang tải bài viết...
      </div>
    ) : filteredBlogs.length > 0 ? (
      filteredBlogs.map((blog) => <BlogCard key={blog.id} {...blog} />)
    ) : (
      <p className="text-gray-500 text-center py-8">
        Không tìm thấy bài viết nào.
      </p>
    )}
  </div>;

  return (
    <div className="max-w-[1150px] mx-auto px-[70px] py-12 lg:flex gap-8">
      {/* Left: Danh sách blog */}
      <div className="lg:w-[68%] w-full">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => <BlogCard key={blog.id} {...blog} />)
        ) : (
          <p className="text-gray-500 text-center py-8">
            Không tìm thấy bài viết nào.
          </p>
        )}

        {/* Pagination giữ nguyên */}
        {searchTerm === "" && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-orange-100"
              }`}
            >
              ‹ Prev
            </button>

            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  currentPage === page
                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
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

      {/* Right: Sidebar */}
      <BlogSidebar blogs={blogs} onSearch={setSearchTerm} />
    </div>
  );
}
