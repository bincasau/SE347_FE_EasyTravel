import React, { useEffect, useState } from "react";
import BlogCard from "../Blog/BlogCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "@/contexts/LangContext";

const PopularTopics = () => {
  const { t } = useLang();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  // 🔥 Fetch Blogs From Backend
  useEffect(() => {
    fetch("http://localhost:8080/blogs")
      .then((res) => res.json())
      .then((data) => {
        const list = data?._embedded?.blogs || [];

        // ⭐ Chỉ hiển thị 8 bài nổi bật
        const limited = list.slice(0, 8);

        // Chuẩn hóa dữ liệu cho BlogCard
        const mapped = limited.map((b) => ({
          id: b.blogId,
          image: `/images/blog/${b.mainImage}`,
          date: b.createdAt?.split("T")[0],
          title: b.title,
          description: b.shortDescription || "",
        }));

        setBlogs(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải blogs:", err);
        setError("Không thể tải danh sách chủ đề.");
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + itemsPerPage) % blogs.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - itemsPerPage;
      return newIndex < 0
        ? Math.floor((blogs.length - 1) / itemsPerPage) * itemsPerPage
        : newIndex;
    });
  };

  const visibleBlogs = Array.from({ length: itemsPerPage }, (_, i) => {
    const index = (currentIndex + i) % blogs.length;
    return blogs[index];
  });

  if (loading)
    return <div className="text-center py-10">Đang tải bài viết...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-white font-poppins">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {t("home.popularTopics.title") || "Popular Topics"}
        </h2>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full border bg-orange-100 text-orange-500 hover:bg-orange-200 transition"
            aria-label="Previous blogs"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-full border bg-orange-500 text-white hover:bg-orange-600 transition"
            aria-label="Next blogs"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      {/* Blog List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
        {visibleBlogs.map((blog) => (
          <BlogCard
            key={blog.id}
            id={blog.id}
            image={blog.image}
            date={blog.date}
            title={blog.title}
            description={blog.description}
          />
        ))}
      </div>
    </section>
  );
};

export default PopularTopics;
