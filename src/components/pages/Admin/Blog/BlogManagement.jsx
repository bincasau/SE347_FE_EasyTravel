import { useEffect, useMemo, useState } from "react";
import { getAllBlogs, deleteBlog } from "@/apis/Blog";
import { Link } from "react-router-dom";
import AdminBlogCard from "@/components/pages/Admin/Blog/AdminBlogCard";
import Pagination from "@/utils/Pagination";
import { popup } from "@/utils/popup";

export default function BlogManagement() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(0); // 0-based

  const size = 5;

  useEffect(() => {
    loadAllBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAllBlogs() {
    try {
      const data = await getAllBlogs();

      const list = Array.isArray(data) ? data : (data?.content ?? []);
      const sorted = [...list].sort((a, b) => {
        const aid = a?.blogId ?? a?.id ?? 0;
        const bid = b?.blogId ?? b?.id ?? 0;
        return Number(bid) - Number(aid);
      });

      setAllBlogs(sorted);
    } catch (error) {
      console.error("Error loading blogs:", error);
      setAllBlogs([]);
      setBlogs([]);
    }
  }

  // paginate theo allBlogs + page
  useEffect(() => {
    const start = page * size;
    setBlogs(allBlogs.slice(start, start + size));
  }, [page, allBlogs]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(allBlogs.length / size)),
    [allBlogs.length],
  );

  // ✅ nếu page vượt totalPages sau khi xóa -> kéo về trang hợp lệ
  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

  const isEmpty = blogs.length === 0;

  // ✅ XÓA: confirm + optimistic + delete API + lùi trang nếu rỗng
  const handleRemove = async (blogId) => {
    const id = Number(blogId);
    if (!id) return;

    const ok = await popup.confirm(
      "Bạn có chắc chắn muốn xóa blog này không?",
      "Xác nhận xóa",
    );
    if (!ok) return;

    const close = popup.loading("Đang xóa blog...");

    try {
      // ✅ optimistic remove
      setAllBlogs((prev) => prev.filter((b) => (b?.blogId ?? b?.id) !== id));

      await deleteBlog(id);

      close?.();
      popup.success("Đã xóa blog");

      // ✅ nếu trang hiện tại bị rỗng sau khi xóa (hay gặp ở trang cuối) -> lùi trang
      // (dùng allBlogs mới tính sau optimistic)
      const nextCount = allBlogs.length - 1; // allBlogs ở closure là cũ, nhưng đủ để xử lý nhanh
      const nextTotalPages = Math.max(1, Math.ceil(nextCount / size));
      const maxPage0 = nextTotalPages - 1;

      if (page > maxPage0) setPage(maxPage0);
    } catch (e) {
      close?.();
      popup.error(e?.message || "Xóa thất bại");

      // rollback bằng reload
      await loadAllBlogs();
    } finally {
      close?.();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Quản lý bài viết</h1>

        <Link to="/admin/blogs/new" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
            Thêm bài viết
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
              onEdit={() => {}}
              onRemove={handleRemove}
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
