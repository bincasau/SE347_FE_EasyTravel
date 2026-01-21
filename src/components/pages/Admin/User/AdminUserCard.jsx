import {
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUserShield,
} from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const S3_USER_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/user";

export default function AdminUserCard({ user, onRemove }) {
  const navigate = useNavigate();

  const avatarSrc = user?.avatar
    ? `${S3_USER_BASE}/${user.avatar}`
    : `${S3_USER_BASE}/user_default.jpg`;

  const handleEdit = () => {
    navigate(`/admin/users/edit/${user.userId}`);
  };

  // ✅ card chỉ bắn event lên parent, không confirm, không popup
  const handleRemove = () => {
    onRemove?.(user);
    // hoặc: onRemove?.(user.userId);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
        {/* Avatar */}
        <div className="w-full lg:w-[260px] flex-shrink-0">
          <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
            <img
              src={avatarSrc}
              alt={user?.fullName ?? user?.name ?? "User"}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = `${S3_USER_BASE}/user_default.jpg`;
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-semibold mb-3 line-clamp-2">
            {user?.fullName ?? user?.name ?? "Chưa có tên"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm text-gray-700">
            <div className="space-y-2 min-w-0">
              <Info
                icon={<FaUserAlt />}
                label="Tên đăng nhập"
                value={user?.username}
              />
              <Info
                icon={<FaEnvelope />}
                label="Email"
                value={user?.email}
                href={user?.email ? `mailto:${user.email}` : undefined}
              />
              <Info
                icon={<FaPhoneAlt />}
                label="Số điện thoại"
                value={user?.phoneNumber}
                href={user?.phoneNumber ? `tel:${user.phoneNumber}` : undefined}
              />
              <Info
                icon={<FaMapMarkerAlt />}
                label="Địa chỉ"
                value={user?.address}
              />
            </div>

            <div className="space-y-2 min-w-0">
              <div className="flex items-start gap-2">
                <FaUserShield className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="min-w-0">
                  <span className="font-semibold">Vai trò:</span>{" "}
                  <RoleBadge value={user?.role} />
                </p>
              </div>

              <div className="flex items-start gap-2">
                <FaUserShield className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="min-w-0">
                  <span className="font-semibold">Trạng thái:</span>{" "}
                  <StatusBadge value={user?.status} />
                </p>
              </div>

              <Info
                icon={<FaPlus />}
                label="Thêm lúc"
                value={user?.createdAt ? formatDate(user.createdAt) : null}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full lg:w-auto flex lg:flex-col gap-3 lg:items-end">
          <button
            onClick={handleEdit}
            className="flex-1 lg:flex-none border border-orange-500 text-orange-500 px-5 sm:px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium"
          >
            Sửa
          </button>

          <button
            onClick={handleRemove}
            className="flex-1 lg:flex-none bg-orange-500 text-white px-5 sm:px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value, href }) {
  const content = value ?? "—";
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0">
        {icon}
      </span>
      <p className="min-w-0">
        <span className="font-semibold">{label}:</span>{" "}
        {href ? (
          <a
            href={href}
            className="break-words text-orange-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </a>
        ) : (
          <span className="break-words">{content}</span>
        )}
      </p>
    </div>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("vi-VN");
}

function RoleBadge({ value }) {
  const v = String(value || "CUSTOMER").toUpperCase();
  const cls =
    v === "ADMIN"
      ? "bg-red-100 text-red-700"
      : v === "TOUR_GUIDE"
        ? "bg-blue-100 text-blue-700"
        : v === "HOTEL_MANAGER"
          ? "bg-orange-100 text-orange-700"
          : "bg-gray-100 text-gray-700";

  const label =
    v === "ADMIN"
      ? "Quản trị viên"
      : v === "TOUR_GUIDE"
        ? "Hướng dẫn viên"
        : v === "HOTEL_MANAGER"
          ? "Quản lý khách sạn"
          : "Khách hàng";

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ value }) {
  const raw = String(value || "").toUpperCase();
  const isActivated = raw === "ACTIVATED";
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
        isActivated ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
      }`}
    >
      {isActivated ? "Đã kích hoạt" : "Chưa kích hoạt"}
    </span>
  );
}
