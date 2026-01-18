// src/pages/Admin/Notification/NotificationCreate.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminBroadcastNotification,
  adminSendNotificationToUsers,
} from "@/apis/NotificationAPI";

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
  );
}

export default function NotificationCreate() {
  const navigate = useNavigate();

  const [type, setType] = useState("broadcast"); // broadcast | specific
  const [message, setMessage] = useState("");
  const [userIdsText, setUserIdsText] = useState(""); // "1,2,3"
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // nếu chuyển về broadcast thì clear userIdsText cho sạch
  useEffect(() => {
    if (type === "broadcast") setUserIdsText("");
  }, [type]);

  const userIds = useMemo(() => {
    if (type !== "specific") return [];
    return userIdsText
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);
  }, [type, userIdsText]);

  const canSubmit = useMemo(() => {
    if (!message.trim()) return false;
    if (type === "specific" && userIds.length === 0) return false;
    return true;
  }, [type, message, userIds.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setErr("");
      setOk("");
      setSending(true);

      const msg = message.trim();

      if (type === "broadcast") {
        await adminBroadcastNotification(msg);
        setOk("Đã gửi thông báo broadcast.");
      } else {
        await adminSendNotificationToUsers(msg, userIds);
        setOk("Đã gửi thông báo cho người dùng đã chọn.");
      }

      setTimeout(() => navigate("/admin/notifications"), 300);
    } catch (e2) {
      setErr(e2?.message || "Gửi thông báo thất bại");
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setMessage("");
    setUserIdsText("");
    setErr("");
    setOk("");
    setType("broadcast");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold truncate">
            Thêm thông báo
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Chọn broadcast hoặc gửi theo danh sách user IDs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/notifications")}
          className="w-full sm:w-auto px-5 py-2.5 rounded-full font-semibold ring-1 ring-gray-200 hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Type */}
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Loại thông báo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-orange-300"
              disabled={sending}
            >
              <option value="broadcast">Broadcast (gửi tất cả)</option>
              <option value="specific">Gửi theo người dùng</option>
            </select>
          </div>

          {/* User IDs */}
          <div className="md:col-span-8">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Người nhận (User IDs)
            </label>
            <input
              value={userIdsText}
              onChange={(e) => setUserIdsText(e.target.value)}
              disabled={type !== "specific" || sending}
              placeholder="Ví dụ: 1,2,3 (chỉ nhập khi chọn 'Gửi theo người dùng')"
              className="w-full rounded-xl ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-orange-300 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              {type === "specific"
                ? "Nhập danh sách ID, ngăn cách bằng dấu phẩy."
                : "Broadcast sẽ gửi cho tất cả người dùng."}
            </div>

            {type === "specific" && userIdsText.trim() ? (
              <div className="mt-1 text-xs text-gray-500">
                Parsed:{" "}
                <span className="font-semibold text-gray-700">
                  {userIds.length ? userIds.join(", ") : "—"}
                </span>
              </div>
            ) : null}
          </div>

          {/* Message */}
          <div className="md:col-span-12">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nội dung thông báo
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              maxLength={1000}
              placeholder="Nhập nội dung..."
              disabled={sending}
              className="w-full rounded-2xl ring-1 ring-gray-200 px-3 py-3 outline-none focus:ring-orange-300 resize-none disabled:bg-gray-50"
            />
            <div className="mt-1 text-xs text-gray-500">
              {message.length}/1000
            </div>
          </div>
        </div>

        {err ? (
          <div className="mt-4 text-sm text-red-700 bg-red-50 ring-1 ring-red-200 rounded-xl px-3 py-2">
            {err}
          </div>
        ) : null}

        {ok ? (
          <div className="mt-4 text-sm text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 rounded-xl px-3 py-2">
            {ok}
          </div>
        ) : null}

        {/* Actions responsive */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-semibold ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60"
            disabled={sending}
          >
            Xóa
          </button>

          <button
            type="submit"
            disabled={!canSubmit || sending}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Spinner /> Đang gửi...
              </>
            ) : (
              "Gửi thông báo"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
