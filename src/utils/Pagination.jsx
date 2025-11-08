import React from "react";

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  visiblePages, // nhận danh sách trang động từ HotelList
}) {
  if (totalPages <= 1) return null;

  const pages =
    visiblePages || Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      {/* Nút Prev */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-orange-100"
        }`}
      >
        ‹ Prev
      </button>

      {/* Các nút số */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
            currentPage === page
              ? "bg-orange-500 text-white border-orange-500 shadow-md"
              : "bg-white text-gray-700 hover:bg-orange-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Nút Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
  );
}
