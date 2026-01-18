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

  const blogId = blog?.blogId ?? blog?.id;
  const imageSrc = blog?.thumbnail ? `${S3_BLOG_BASE}/${blog.thumbnail}` : "";

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
    <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 sm:gap-6 p-4 sm:p-6">
        {/* IMAGE */}
        <div className="w-full sm:w-60 shrink-0">
          <img
            src={imageSrc}
            alt={blog?.title || "blog"}
            className="w-full h-48 sm:h-36 rounded-xl object-cover bg-gray-100"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* TITLE */}
          <h2 className="text-lg sm:text-2xl font-semibold leading-snug line-clamp-2 break-words">
            {blog?.title || "—"}
          </h2>

          {/* DETAILS */}
          <p className="mt-2 sm:mt-3 text-sm text-gray-700 line-clamp-4 break-words">
            {blog?.details || blog?.content || "—"}
          </p>

          {/* CREATED AT */}
          <div className="mt-3 sm:mt-4 text-sm text-gray-700 flex items-center gap-2">
            <FaRegClock className="text-orange-500 shrink-0" />
            <span className="font-semibold">Created:</span>
            <span className="whitespace-nowrap">{formatDate(blog?.createdAt)}</span>
          </div>

          {/* ACTIONS (mobile) */}
          <div className="mt-4 flex flex-col gap-2 sm:hidden">
            <button
              onClick={handleEdit}
              className="w-full border border-orange-500 text-orange-500 px-6 py-2 rounded-full hover:bg-orange-50 transition font-medium"
            >
              Edit
            </button>

            <button
              onClick={handleRemove}
              className="w-full bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition font-medium"
            >
              Remove
            </button>
          </div>
        </div>

        {/* ACTIONS (desktop) */}
        <div className="hidden sm:flex flex-col items-end gap-3 ml-2">
          <button
            onClick={handleEdit}
            className="border border-orange-500 text-orange-500 px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium whitespace-nowrap"
          >
            Edit
          </button>

          <button
            onClick={handleRemove}
            className="bg-orange-500 text-white px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium whitespace-nowrap"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
