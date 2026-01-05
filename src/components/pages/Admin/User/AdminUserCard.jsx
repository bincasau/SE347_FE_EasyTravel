import {
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUserShield,
  FaRegClock,
} from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

const S3_USER_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/user";

export default function AdminUserCard({ user, onEdit, onRemove }) {
  const avatarSrc = user?.avatar
    ? `${S3_USER_BASE}/${user.avatar}`
    : `${S3_USER_BASE}/user_default.jpg`;

  return (
    <div className="flex items-center gap-8 bg-white p-6 rounded-2xl shadow-md w-full">
      <img
        src={avatarSrc}
        alt={user?.name || "User"}
        className="w-60 h-36 rounded-xl object-cover flex-shrink-0 bg-gray-100"
        onError={(e) => {
          e.currentTarget.src = `${S3_USER_BASE}/user_default.jpg`;
        }}
      />

      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-3 line-clamp-2">
          {user?.name || "Unnamed User"}
        </h2>

        <div className="flex gap-12 text-sm text-gray-700">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FaUserAlt className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="min-w-0">
                <span className="font-semibold">Username:</span>{" "}
                <span className="break-words">{user?.username ?? "—"}</span>
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaEnvelope className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="min-w-0">
                <span className="font-semibold">Email:</span>{" "}
                <span className="break-words">{user?.email ?? "—"}</span>
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaPhoneAlt className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="min-w-0">
                <span className="font-semibold">Phone:</span>{" "}
                <span className="break-words">{user?.phoneNumber ?? "—"}</span>
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="min-w-0">
                <span className="font-semibold">Address:</span>{" "}
                <span className="break-words">{user?.address ?? "—"}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FaUserShield className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="min-w-0">
                <span className="font-semibold">Role:</span>{" "}
                <RoleBadge value={user?.role} />
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaUserShield className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="min-w-0">
                <span className="font-semibold">Status:</span>{" "}
                <StatusBadge value={user?.status} />
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaPlus className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="min-w-0">
                <span className="font-semibold">Added on:</span>{" "}
                {user?.createdAt ? formatDate(user.createdAt) : "—"}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <FaRegClock className="w-5 h-5 text-orange-400 mt-0.5" />
              <p className="min-w-0">
                <span className="font-semibold">Update:</span>{" "}
                {user?.updatedAt ? formatDate(user.updatedAt) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-4 ml-4">
        <button
          onClick={() => onEdit?.(user)}
          className="border border-orange-500 text-orange-500 px-8 py-2 rounded-full hover:bg-orange-50 transition font-medium"
        >
          Edit
        </button>

        <button
          onClick={() => onRemove?.(user.userId)}
          className="bg-orange-500 text-white px-8 py-2 rounded-full hover:bg-orange-600 transition font-medium"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB");
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

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      {v}
    </span>
  );
}

function StatusBadge({ value }) {
  const raw = String(value || "ACTIVE").toUpperCase();
  const isActive = raw === "ACTIVE" || raw === "ACTIVATED";

  const cls = isActive
    ? "bg-green-100 text-green-700"
    : "bg-gray-200 text-gray-700";

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      {isActive ? "Activated" : "Not activated"}
    </span>
  );
}
