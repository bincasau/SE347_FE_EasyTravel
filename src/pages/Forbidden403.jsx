import { Link } from "react-router-dom";

export default function Forbidden403() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white border rounded-2xl shadow-sm p-8">
        <div className="text-6xl font-extrabold text-orange-500">403</div>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">
          Không có quyền truy cập
        </h1>
        <p className="mt-2 text-gray-600 text-sm">
          Bạn không được phép vào trang này. Vui lòng đăng nhập đúng tài khoản hoặc quay về trang chủ.
        </p>

        <div className="mt-6 flex gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600"
          >
            Về trang chủ
          </Link>
          <Link
            to="/tours"
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Xem tours
          </Link>
        </div>
      </div>
    </div>
  );
}
