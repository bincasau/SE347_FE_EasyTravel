import React from "react";
import { useNavigate } from "react-router-dom";

const BlogCard = ({ id, image, date, title, description }) => {
  const navigate = useNavigate();

  // Khi click vào bài viết, điều hướng đến trang chi tiết
  const handleNavigate = () => {
    navigate(`/detailblog/${id}`, {
      state: { id, image, date, title, description },
    });
  };

  return (
    <div className="mb-12">
      {/* Ảnh */}
      <img
        src={image}
        alt={title}
        className="w-full h-[350px] object-cover rounded-lg cursor-pointer hover:scale-[1.02] transition-transform duration-300"
        onClick={handleNavigate}
      />

      {/* Ngày tạo */}
      <div className="mt-4 text-sm text-gray-500">
        {date} • <span className="text-gray-600 font-medium">Admin</span>
      </div>

      {/* Tiêu đề */}
      <h2
        onClick={handleNavigate}
        className="text-lg md:text-xl font-bold text-gray-900 mt-2 hover:text-orange-500 cursor-pointer leading-snug"
      >
        {title}
      </h2>

      {/* Mô tả ngắn */}
      <p className="text-gray-600 mt-2 text-sm md:text-base">{description}</p>

      {/* Nút đọc thêm */}
      <button
        onClick={handleNavigate}
        className="text-orange-500 font-medium mt-3 inline-flex items-center text-sm md:text-base hover:underline"
      >
        Read more <span className="ml-1 text-lg">→</span>
      </button>
    </div>
  );
};

export default BlogCard;
