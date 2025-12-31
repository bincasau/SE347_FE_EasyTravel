import { useEffect, useState } from "react";
import { getAllBlogs } from "@/apis/Blog";
import AdminBlogCard from "@/components/pages/Admin/Blog/AdminBlogCard";

export default function BlogManagement() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(0);

  const size = 5; // mỗi trang 5 blog

  useEffect(() => {
    loadAllBlogs();
  }, []);

  async function loadAllBlogs() {
    try {
      const data = await getAllBlogs();
      setAllBlogs(data ?? []);
      setBlogs((data ?? []).slice(0, size));
    } catch (error) {
      console.error("Error loading blogs:", error);
    }
  }

  // Cập nhật dữ liệu khi chuyển trang
  useEffect(() => {
    const start = page * size;
    const end = start + size;
    setBlogs(allBlogs.slice(start, end));
  }, [page, allBlogs]);

  const totalPages = Math.ceil(allBlogs.length / size) || 1;

  function handleNext() {
    if (page + 1 < totalPages) setPage(page + 1);
  }

  function handlePrev() {
    if (page > 0) setPage(page - 1);
  }

  return (
    <div className="max-w-5xl mx-auto py-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Blog management</h1>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2 rounded-full border border-gray-300 text-sm">
            All ▼
          </button>

          <button className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
            + Add Blog
          </button>
        </div>
      </div>

      {/* LIST */}
      {blogs.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No blogs found.</p>
      ) : (
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
      )}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className={`px-4 py-2 rounded-full border ${
            page === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          Prev
        </button>

        <span className="font-medium">
          Page {page + 1} / {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={page + 1 >= totalPages}
          className={`px-4 py-2 rounded-full border ${
            page + 1 >= totalPages
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
