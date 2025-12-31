import { FaRegIdBadge, FaUserAlt, FaRegClock, FaPlus } from "react-icons/fa";

const S3_BLOG_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/blog";

export default function AdminBlogCard({ blog, onView, onApprove, onRemove }) {
  const imageSrc = `${S3_BLOG_BASE}/${blog.thumbnail}`;

  return (
    <div className="flex items-center gap-8 bg-white p-6 rounded-2xl shadow-md w-full">
      {/* IMAGE */}
      <img
        src={imageSrc}
        alt={blog.title}
        className="w-60 h-36 rounded-xl object-cover flex-shrink-0 bg-gray-100"
      />

      {/* LEFT INFO */}
      <div className="flex flex-col flex-1">
        {/* TITLE */}
        <h2 className="text-2xl font-semibold leading-snug break-words line-clamp-2">
          {blog.title}
        </h2>

        <div className="mt-3 space-y-1 text-sm text-gray-700">
          <p className="flex items-center gap-2">
            <FaRegIdBadge className="text-orange-500" />
            <span className="font-semibold">Blog ID:</span> {blog.blogId}
          </p>

          <p className="flex items-center gap-2">
            <FaUserAlt className="text-orange-500" />
            <span className="font-semibold">Author ID:</span>{" "}
            {blog.userId ?? "..."}
          </p>
        </div>
      </div>

      {/* RIGHT INFO – CỘT CỐ ĐỊNH */}
      <div className="flex flex-col justify-center text-sm text-gray-700 w-56">
        <span className="mb-2 inline-block px-4 py-1 bg-orange-400 text-white rounded-full text-sm font-medium w-fit">
          Pending
        </span>

        <p className="flex items-center gap-2">
          <FaPlus className="text-orange-500" />
          <span className="font-semibold">Created:</span>
          {new Date(blog.createdAt).toLocaleDateString("en-GB")}
        </p>

        <p className="flex items-center gap-2 mt-2">
          <FaRegClock className="text-orange-500" />
          <span className="font-semibold">Updated:</span>
          {blog.updatedAt
            ? new Date(blog.updatedAt).toLocaleDateString("en-GB")
            : "—"}
        </p>
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
          onClick={onApprove}
          className="bg-green-500 text-white px-8 py-2 rounded-full hover:bg-green-600 transition font-medium"
        >
          Approve
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
