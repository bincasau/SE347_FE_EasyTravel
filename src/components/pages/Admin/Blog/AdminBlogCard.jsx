import { FaRegClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { deleteBlog } from "@/apis/Blog";

const S3_BLOG_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";

// format dd/mm/yyyy
const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(date) ? "—" : date.toLocaleDateString("en-GB");
};

export default function AdminBlogCard({ blog, onEdit, onRemove }) {
  const navigate = useNavigate();
  const imageSrc = `${S3_BLOG_BASE}/${blog.thumbnail}`;

  const blogId = blog.blogId ?? blog.id;

  const handleEdit = () => {
    navigate(`/admin/blogs/edit/${blogId}`, { state: blog });
    if (typeof onEdit === "function") onEdit(blog);
  };

  const handleRemove = async () => {
    const ok = window.confirm("Bạn có chắc chắn muốn xóa blog này không?");
    if (!ok) return;

    try {
      await deleteBlog(blogId);
      if (typeof onRemove === "function") onRemove(blogId);
    } catch (e) {
      alert(e?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="flex items-center gap-8 bg-white p-6 rounded-2xl shadow-md w-full">
      {/* IMAGE */}
      <img
        src={imageSrc}
        alt={blog.title}
        className="w-60 h-36 rounded-xl object-cover flex-shrink-0 bg-gray-100"
      />

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* TITLE */}
        <h2 className="text-2xl font-semibold leading-snug line-clamp-2">
          {blog.title}
        </h2>

        {/* DETAILS */}
        <p className="mt-3 text-sm text-gray-700 line-clamp-4">
          {blog.details || blog.content || "—"}
        </p>

        {/* CREATED AT */}
        <div className="mt-4 text-sm text-gray-700 flex items-center gap-2">
          <FaRegClock className="text-orange-500" />
          <span className="font-semibold">Created:</span>
          {formatDate(blog.createdAt)}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col items-end gap-4 ml-4">
        <button
          onClick={handleEdit}
          className="border border-orange-500 text-orange-500 px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium"
        >
          Edit
        </button>

        <button
          onClick={handleRemove}
          className="bg-orange-500 text-white px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
