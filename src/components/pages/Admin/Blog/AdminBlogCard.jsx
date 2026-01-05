import { FaEye, FaEdit, FaTrash, FaRegClock } from "react-icons/fa";

const S3_BLOG_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";

// format dd/mm/yyyy
const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(date) ? "—" : date.toLocaleDateString("en-GB");
};

export default function AdminBlogCard({ blog, onView, onEdit, onRemove }) {
  const imageSrc = `${S3_BLOG_BASE}/${blog.thumbnail}`;

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

        {/* CREATED / UPDATED */}
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p className="flex items-center gap-2">
            <FaRegClock className="text-orange-500" />
            <span className="font-semibold">Created:</span>
            {formatDate(blog.createdAt)}
          </p>

          <p className="flex items-center gap-2">
            <FaRegClock className="text-orange-500" />
            <span className="font-semibold">Updated:</span>
            {formatDate(blog.updatedAt)}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col items-end gap-4 ml-4">
        <button
          onClick={onView}
          className="border border-orange-500 text-orange-500 px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium"
        >
          View
        </button>

        <button
          onClick={onEdit}
          className="bg-blue-500 text-white px-8 py-2 rounded-full hover:bg-blue-600 transition font-medium"
        >
          Edit
        </button>

        <button
          onClick={onRemove}
          className="bg-orange-500 text-white px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
