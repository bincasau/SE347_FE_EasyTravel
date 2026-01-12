import { useMemo, useState } from "react";

function formatDateTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}

function toBool(v) {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "1" || s === "true") return true;
    if (s === "0" || s === "false" || s === "") return false;
  }
  return !!v;
}

function normalizeStatus(s) {
  return (s ?? "").toString().trim().toUpperCase();
}

function badgeClass(type) {
  if (type === "broadcast") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (type === "specific")
    return "bg-purple-50 text-purple-700 ring-purple-200";

  if (type === "active")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (type === "not_active") return "bg-gray-50 text-gray-700 ring-gray-200";

  if (type === "read") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (type === "unread") return "bg-amber-50 text-amber-800 ring-amber-200";

  return "bg-gray-50 text-gray-700 ring-gray-200";
}

export default function AdminNotificationCard({
  notif,
  onToggleActive, // (id, "ACTIVE" | "NOT ACTIVE")
  onDelete, // (id)
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const id = notif?.notificationId ?? notif?.notification_id ?? notif?.id;

  // ✅ đúng key BE trả về
  const isBroadcast = toBool(
    notif?.broadCast ?? notif?.isBroadcast ?? notif?.is_broadcast
  );
  const isRead = toBool(notif?.read ?? notif?.isRead ?? notif?.is_read);

  const createdAtText = useMemo(
    () => formatDateTime(notif?.createdAt ?? notif?.created_at),
    [notif?.createdAt, notif?.created_at]
  );

  const status = useMemo(() => normalizeStatus(notif?.status), [notif?.status]);

  const typeLabel = isBroadcast
    ? "Broadcast (gửi tất cả)"
    : "Gửi theo người dùng";
  const typeBadge = isBroadcast ? "broadcast" : "specific";

  const readLabel = isRead ? "Đã đọc" : "Chưa đọc";
  const readBadge = isRead ? "read" : "unread";

  const isActive = status === "ACTIVE";
  const activeLabel = isActive ? "Đang kích hoạt" : "Chưa kích hoạt";
  const activeBadge = isActive ? "active" : "not_active";

  const handleToggleActive = async () => {
    if (!id || typeof onToggleActive !== "function") return;
    const nextStatus = isActive ? "NOT ACTIVE" : "ACTIVE";
    try {
      setErr("");
      setBusy(true);
      await onToggleActive(id, nextStatus);
    } catch (e) {
      setErr(e?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!id || typeof onDelete !== "function") return;
    const ok = window.confirm("Bạn có chắc chắn muốn xóa thông báo này không?");
    if (!ok) return;

    try {
      setErr("");
      setBusy(true);
      await onDelete(id);
    } catch (e) {
      setErr(e?.message || "Xóa thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5 w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm text-gray-500">
              Mã:{" "}
              <span className="text-gray-900 font-semibold">{id ?? "-"}</span>
            </div>

            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${badgeClass(
                typeBadge
              )}`}
            >
              {typeLabel}
            </span>

            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${badgeClass(
                readBadge
              )}`}
            >
              {readLabel}
            </span>

            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${badgeClass(
                activeBadge
              )}`}
            >
              {activeLabel}
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            Tạo lúc: <span className="text-gray-900">{createdAtText}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            disabled={busy || !onToggleActive}
            onClick={handleToggleActive}
            className="px-4 py-2 rounded-xl text-sm font-semibold ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60"
          >
            {isActive ? "Tắt kích hoạt" : "Kích hoạt"}
          </button>

          <button
            disabled={busy || !onDelete}
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl text-sm font-semibold ring-1 ring-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold text-gray-900 mb-1">Nội dung</div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {notif?.message || "-"}
        </div>
      </div>

      {err && (
        <div className="mt-4 text-sm text-red-700 bg-red-50 ring-1 ring-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}

      {busy && <div className="mt-3 text-xs text-gray-500">Đang xử lý...</div>}
    </div>
  );
}
