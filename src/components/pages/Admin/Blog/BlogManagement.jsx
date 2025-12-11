import { useEffect, useState } from "react";
import { getAllBlogs } from "@/apis/Blog";
import AdminBlogCard from "@/components/pages/Admin/Blog/AdminBlogCard";

export default function BlogManagement() {
  const [allBlogs, setAllBlogs] = useState([]); // toàn bộ
  const [blogs, setBlogs] = useState([]); // hiển thị theo trang
  const [page, setPage] = useState(0);

  const size = 5; // mỗi trang 5 blog

  useEffect(() => {
    loadAllBlogs();
  }, []);

  async function loadAllBlogs() {
    const data = await getAllBlogs();
    setAllBlogs(data);

    // load trang đầu tiên
    setBlogs(data.slice(0, size));
  }

  // cập nhật dữ liệu khi chuyển trang
  useEffect(() => {
    const start = page * size;
    const end = start + size;
    setBlogs(allBlogs.slice(start, end));
  }, [page, allBlogs]);

  const totalPages = Math.ceil(allBlogs.length / size);

  function handleNext() {
    if (page + 1 < totalPages) setPage(page + 1);
  }

  function handlePrev() {
    if (page > 0) setPage(page - 1);
  }

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Blog management</h1>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2 rounded-full border border-gray-300 text-sm">
            All ▼
          </button>

          <button className="px-5 py-2 rounded-full bg-orange-500 text-white text-sm">
            + Add Blog
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-6">
        {blogs.map((b) => (
          <AdminBlogCard
            key={b.blogId}
            blog={b}
            onView={() => console.log("View", b.blogId)}
            onApprove={() => console.log("Approve", b.blogId)}
            onRemove={() => console.log("Remove", b.blogId)}
          />
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className={`px-4 py-2 rounded-lg border ${
            page === 0 ? "opacity-40" : "hover:bg-gray-100"
          }`}
        >
          Prev
        </button>

        <span className="font-medium">
          Page {page + 1} / {totalPages || 1}
        </span>

        <button
          onClick={handleNext}
          disabled={page + 1 >= totalPages}
          className={`px-4 py-2 rounded-lg border ${
            page + 1 >= totalPages ? "opacity-40" : "hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
