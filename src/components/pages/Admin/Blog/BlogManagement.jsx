import { useEffect, useState } from "react";
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
      const list = data ?? [];
      setAllBlogs(list);
      setBlogs(list.slice(0, size));
    } catch (error) {
      console.error("Error loading blogs:", error);
    }
  }

  useEffect(() => {
    const start = page * size;
    setBlogs(allBlogs.slice(start, start + size));
  }, [page, allBlogs]);

  const totalPages = Math.ceil(allBlogs.length / size) || 1;

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Blog management</h1>

        <Link to="/admin/blogs/new">
          <button className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
            + Add Blog
          </button>
        </Link>
      </div>

      {blogs.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No blogs found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {blogs.map((b) => (
            <AdminBlogCard
              key={b.blogId}
              blog={b}
              onEdit={() => console.log("Edit", b.blogId)}
              onRemove={() => console.log("Remove", b.blogId)}
            />
          ))}
        </div>
      )}

      <Pagination
        totalPages={totalPages}
        currentPage={page + 1}
        visiblePages={null}
        onPageChange={(p) => setPage(p - 1)}
      />
    </div>
  );
}
