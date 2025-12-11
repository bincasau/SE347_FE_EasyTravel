import { FaRegIdBadge, FaUserAlt, FaRegClock, FaPlus } from "react-icons/fa";

export default function AdminBlogCard({ blog, onView, onApprove, onRemove }) {
  const imageSrc = `/images/blog/${blog.thumbnail}`;

  return (
    <div className="flex items-start gap-6 bg-white p-6 rounded-2xl shadow-md w-full">
      {/* IMAGE */}
      <img
        src={imageSrc}
        alt={blog.title}
        className="w-60 h-40 rounded-xl object-cover flex-shrink-0 bg-gray-100"
      />

      {/* INFO */}
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{blog.title}</h2>

          {/* STATUS */}
          <span className="px-5 py-2 bg-orange-400 text-white rounded-full text-sm font-medium">
            Pending
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-gray-700 text-sm">
          <p className="flex items-center gap-2">
            <FaRegIdBadge className="text-orange-500" />
            <span className="font-semibold">Blog ID:</span> {blog.blogId}
          </p>

          <p className="flex items-center gap-2">
            <FaUserAlt className="text-orange-500" />
            <span className="font-semibold">Author ID:</span>{" "}
            {blog.userId ?? "..."}
          </p>

          <p className="flex items-center gap-2">
            <FaPlus className="text-orange-500" />
            <span className="font-semibold">Created at:</span>{" "}
            {new Date(blog.createdAt).toLocaleString()}
          </p>

          <p className="flex items-center gap-2">
            <FaRegClock className="text-orange-500" />
            <span className="font-semibold">Updated at:</span>{" "}
            {blog.updatedAt ? new Date(blog.updatedAt).toLocaleString() : "—"}
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col items-end gap-3 min-w-[130px]">
        <button
          onClick={onView}
          className="px-5 py-2 border border-orange-400 text-orange-400 rounded-full text-sm hover:bg-orange-50 transition"
        >
          View Detail
        </button>

        <button
          onClick={onApprove}
          className="px-5 py-2 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition"
        >
          Approve
        </button>

        <button
          onClick={onRemove}
          className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
