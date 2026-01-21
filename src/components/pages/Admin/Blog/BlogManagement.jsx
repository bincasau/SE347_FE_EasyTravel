import { useEffect, useMemo, useState } from "react";
import { getAllBlogs } from "@/apis/Blog";
import { Link } from "react-router-dom";
import AdminBlogCard from "@/components/pages/Admin/Blog/AdminBlogCard";
import Pagination from "@/utils/Pagination";

export default function BlogManagement() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(0);

  const size = 5;

  useEffect(() => {
    loadAllBlogs();
  }, []);

  async function loadAllBlogs() {
    try {
      const data = await getAllBlogs();
      const list = Array.isArray(data) ? data : data?.content ?? [];
      const sorted = [...list].sort((a, b) => {
        const aid = a?.blogId ?? a?.id ?? 0;
        const bid = b?.blogId ?? b?.id ?? 0;
        return Number(bid) - Number(aid);
      });
      setAllBlogs(sorted);
      setBlogs(sorted.slice(0, size));
    } catch (error) {
      console.error("Error loading blogs:", error);
      setAllBlogs([]);
      setBlogs([]);
    }
  }

  useEffect(() => {
    const start = page * size;
    setBlogs(allBlogs.slice(start, start + size));
  }, [page, allBlogs]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(allBlogs.length / size)), [allBlogs.length]);
  const isEmpty = blogs.length === 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Blog management</h1>

        <Link to="/admin/blogs/new" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
            + Add Blog
          </button>
        </Link>
      </div>

      {/* CONTENT */}
      {isEmpty ? (
        <p className="text-center py-10 text-gray-500">No blogs found.</p>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6">
          {blogs.map((b) => (
            <AdminBlogCard
              key={b.blogId ?? b.id}
              blog={b}
              onEdit={() => console.log("Edit", b.blogId ?? b.id)}
              onRemove={() => console.log("Remove", b.blogId ?? b.id)}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center px-2">
          <div className="w-full sm:w-auto overflow-x-auto">
            <Pagination
              totalPages={totalPages}
              currentPage={page + 1}
              visiblePages={null}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
