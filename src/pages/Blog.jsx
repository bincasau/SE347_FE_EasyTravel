import React, { useEffect, useRef, useState } from "react";
import BlogCard from "../components/pages/Blog/BlogCard";
import BlogSidebar from "../components/pages/Blog/BlogSiderbar";
import { useLang } from "../contexts/LangContext";

export default function Blog() {
  const { t } = useLang();
  // ✅ sidebarBlogs: load 1 lần để sidebar recent/gallery
  const [sidebarBlogs, setSidebarBlogs] = useState([]);

  // ✅ pagedBlogs: list theo page (3 bài/trang)
  const [pagedBlogs, setPagedBlogs] = useState([]);

  // ✅ list hiển thị bên trái (có thể = pagedBlogs hoặc list filter)
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(true);

  const blogsPerPage = 3;
  const BASE_URL = "http://localhost:8080";

  // ✅ scroll to top list
  const listTopRef = useRef(null);

  const S3_BLOG_BASE =
    "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";
  const getBlogImage = (blogId) => `${S3_BLOG_BASE}/blog_${blogId}.jpg`;

  const toDesc = (details) => {
    const text = details || "";
    if (!text) return t("blogPage.noArticles");
    return text.slice(0, 200) + (text.length > 200 ? "..." : "");
  };

  const mapBlog = (b, fallbackIndex = 0) => ({
    id: b.blogId ?? b.id ?? fallbackIndex,
    title: b.title ?? "",
    date: b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN") : "",
    description: toDesc(b.details),
    image: getBlogImage(b.blogId ?? b.id ?? fallbackIndex),
    createdAt: b.createdAt ?? null,
  });

  // =========================
  // ✅ 1) Debounce search
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 700);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // =========================
  // ✅ 2) Load ALL blogs ONCE for sidebar
  //    (loop pages để lấy hết)
  // =========================
  const fetchAllBlogsOnce = async () => {
    try {
      // load nhẹ nhàng: loop theo page/size
      const size = 50; // mỗi request 50, tùy bạn
      let page = 0;
      let all = [];
      let total = 1;

      while (page < total) {
        const res = await fetch(`${BASE_URL}/blogs?page=${page}&size=${size}`);
        if (!res.ok) throw new Error("Failed to load all blogs");

        const data = await res.json();
        const items = data._embedded?.blogs || [];
        all = all.concat(items);

        total = data.page?.totalPages || 1;
        page += 1;
      }

      const formatted = all.map((b, idx) => mapBlog(b, idx));
      setSidebarBlogs(formatted);
    } catch (err) {
      console.error("Error fetching all blogs for sidebar:", err);
      setSidebarBlogs([]);
    }
  };

  useEffect(() => {
    fetchAllBlogsOnce(); // ✅ chỉ chạy 1 lần khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // ✅ 3) Fetch blogs default paged (3 bài/trang)
  // =========================
  const fetchBlogsPaged = async (page = 1) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/blogs?page=${page - 1}&size=${blogsPerPage}`
      );
      if (!res.ok) throw new Error("Failed to load blog list");

      const data = await res.json();
      const items = data._embedded?.blogs || [];
      const formatted = items.map((b, index) => mapBlog(b, index));

      setPagedBlogs(formatted);
      setFilteredBlogs(formatted);
      setTotalPages(data.page?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setPagedBlogs([]);
      setFilteredBlogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Load default theo page (chỉ khi KHÔNG có search/date/tag)
  useEffect(() => {
    if (debouncedSearch !== "" || filterDate !== "" || selectedTag !== "") return;
    fetchBlogsPaged(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, filterDate, selectedTag]);

  // ✅ auto scroll top khi đổi trang (default mode)
  useEffect(() => {
    const isDefaultMode =
      debouncedSearch === "" && filterDate === "" && selectedTag === "";
    if (!isDefaultMode) return;

    window.scrollTo({ top: 0, behavior: "smooth" });

  }, [currentPage, debouncedSearch, filterDate, selectedTag]);

  // =========================
  // ✅ 4) SEARCH + FILTER DATE (không tag)
  // =========================
  useEffect(() => {
    const fetchFiltered = async () => {
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
          setCurrentPage(1);
          fetchBlogsPaged(1);
          return;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error filtering data");

        const data = await res.json();
        const items = data._embedded?.blogs || [];
        const formatted = items.map((b, index) => mapBlog(b, index));

        setFilteredBlogs(formatted);

        // ✅ pagedBlogs không còn ảnh hưởng sidebar nữa
        setPagedBlogs(formatted);

        setTotalPages(1);
        setCurrentPage(1);

        // scroll top khi filter/search
        window.scrollTo({ top: 0, behavior: "smooth" });

      } catch (err) {
        console.error("❌ Filter error:", err);
        setFilteredBlogs([]);
        setPagedBlogs([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterDate, selectedTag]);

  // =========================
  // ✅ 5) FILTER BY TAG
  // =========================
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
      setFilteredBlogs(formatted);
      setPagedBlogs(formatted);

      setTotalPages(1);
      setCurrentPage(1);

      setSearchTerm("");
      setDebouncedSearch("");
      setFilterDate("");

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      console.error("❌ Tag filter error:", err);
      setFilteredBlogs([]);
      setPagedBlogs([]);
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
    fetchBlogsPaged(1);
  };

  // PAGINATION
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
    debouncedSearch === "" &&
    filterDate === "" &&
    selectedTag === "" &&
    totalPages > 1;

  return (
    <div
      className="
        max-w-[1150px] mx-auto
        px-4 sm:px-6 lg:px-[70px]
        py-12
        flex flex-col lg:flex-row
        gap-8
      "
    >
      {/* ✅ SIDEBAR */}
      <div className="w-full lg:w-[32%] lg:order-2">
        <BlogSidebar
          // ✅ dùng sidebarBlogs (load 1 lần) thay vì pagedBlogs
          blogs={sidebarBlogs}
          onSearch={(v) => {
            setSearchTerm(v);
            // nếu đang ở trang khác, về trang 1 cho UX đẹp
            setCurrentPage(1);
          }}
          onTagSelect={handleTagSelect}
          onDateFilter={(v) => {
            setFilterDate(v);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ✅ LIST */}
      <div className="w-full lg:w-[68%] lg:order-1">
        <div ref={listTopRef} />

        {selectedTag && (
          <div className="mb-6 flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {t("blogPage.filteredByTag")}: <b>{selectedTag}</b>
            </div>
            <button
              onClick={clearTag}
              className="text-orange-600 hover:underline text-sm"
            >
              {t("blogPage.clearTag")}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">{t("blogPage.loading")}</div>
        ) : filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => <BlogCard key={blog.id} {...blog} />)
        ) : (
          <p className="text-gray-500 text-center py-8">{t("blogPage.noArticles")}</p>
        )}

        {showPagination && (
          <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
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
    </div>
  );
}
