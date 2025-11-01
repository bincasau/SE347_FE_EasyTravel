import React from "react";
import { useNavigate } from "react-router-dom";

const BlogCard = ({ image, date, author, title, description }) => {
  const navigate = useNavigate();

  // Hàm chuyển trang khi click
  const handleNavigate = () => {
    navigate("/detailblog");
  };

  return (
    <div className="mb-12">
      <img
        src={image}
        alt={title}
        className="w-full h-[350px] object-cover rounded-lg cursor-pointer"
        onClick={handleNavigate}
      />

      <div className="mt-4 text-sm text-gray-500">
        {date} • <span className="text-gray-600 font-medium">{author}</span>
      </div>

      <h2
        onClick={handleNavigate}
        className="text-lg md:text-xl font-bold text-gray-900 mt-2 hover:text-blue-600 cursor-pointer leading-snug"
      >
        {title}
      </h2>

      <p className="text-gray-600 mt-2 text-sm md:text-base">{description}</p>

      <button
        onClick={handleNavigate}
        className="text-red-500 font-medium mt-3 inline-flex items-center text-sm md:text-base hover:underline"
      >
        Read more <span className="ml-1 text-lg">→</span>
      </button>
    </div>
  );
};

export default BlogCard;
