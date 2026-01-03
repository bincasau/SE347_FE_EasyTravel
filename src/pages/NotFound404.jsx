import { Link, useLocation } from "react-router-dom";

export default function NotFound404() {
  const location = useLocation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white border rounded-2xl shadow-sm p-8">
        <div className="text-6xl font-extrabold text-gray-800">404</div>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">
          Không tìm thấy trang
        </h1>
        <p className="mt-2 text-gray-600 text-sm">
          URL <span className="font-mono bg-gray-100 px-2 py-1 rounded">{location.pathname}</span>{" "}
          không tồn tại hoặc đã bị xoá.
        </p>

        <div className="mt-6 flex gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600"
          >
            Về trang chủ
          </Link>
          <Link
            to="/blog"
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Xem blog
          </Link>
        </div>
      </div>
    </div>
  );
}
