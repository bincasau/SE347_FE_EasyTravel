import React from "react";
import { useNavigate } from "react-router-dom";
import { buildTourSlug } from "@/utils/slug";

const BlogCard = ({ id, image, date, title, description }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    const slugId = buildTourSlug(id, title);
    navigate(`/detailblog/${slugId}`, {
      state: { id, image, date, title, description },
    });
  };

  return (
    <article className="mb-8 sm:mb-10">
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
            className="
              w-full
              aspect-[4/3]
              sm:aspect-[16/9]
              lg:aspect-[21/9]
              object-cover
              hover:scale-[1.02]
              transition-transform
              duration-300
            "
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]" />
        )}
      </div>

      <div className="mt-3 text-xs sm:text-sm text-gray-500">
        {date} • <span className="text-gray-600 font-medium">Admin</span>
      </div>

      <h2
        onClick={handleNavigate}
        className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mt-1.5 hover:text-orange-500 cursor-pointer leading-snug line-clamp-2"
      >
        {title}
      </h2>

      <p className="text-gray-600 mt-1.5 text-sm sm:text-base leading-6 line-clamp-3">
        {description}
      </p>

      <button
        onClick={handleNavigate}
        className="text-orange-500 font-medium mt-2 inline-flex items-center text-sm sm:text-base hover:underline"
      >
        Read more <span className="ml-1 text-lg">→</span>
      </button>
    </article>
  );
};

export default BlogCard;
