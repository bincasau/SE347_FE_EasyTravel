import React from "react";
import { useNavigate } from "react-router-dom";

const BlogCard = ({ id, image, date, title, description }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/detailblog/${id}`, {
      state: { id, image, date, title, description },
    });
  };

  return (
    <article className="mb-10 sm:mb-12">
      {/* Ảnh: dùng aspect để responsive đẹp, không fix 350px */}
      <div
        className="w-full rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
        onClick={handleNavigate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full aspect-[16/9] sm:aspect-[21/9] object-cover hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[16/9] sm:aspect-[21/9]" />
        )}
      </div>

      {/* Ngày tạo */}
      <div className="mt-4 text-xs sm:text-sm text-gray-500">
        {date} • <span className="text-gray-600 font-medium">Admin</span>
      </div>

      {/* Tiêu đề */}
      <h2
        onClick={handleNavigate}
        className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-2 hover:text-orange-500 cursor-pointer leading-snug line-clamp-2"
      >
        {title}
      </h2>

      {/* Mô tả ngắn */}
      <p className="text-gray-600 mt-2 text-sm sm:text-base leading-6 line-clamp-3">
        {description}
      </p>

      {/* Nút đọc thêm */}
      <button
        onClick={handleNavigate}
        className="text-orange-500 font-medium mt-3 inline-flex items-center text-sm sm:text-base hover:underline"
      >
        Read more <span className="ml-1 text-lg">→</span>
      </button>
    </article>
  );
};

export default BlogCard;
