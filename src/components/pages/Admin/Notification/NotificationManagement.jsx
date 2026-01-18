import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNotificationCard from "@/components/pages/Admin/Notification/AdminNotificationCard";
import {
  adminGetAllNotifications,
  adminDeleteNotification,
  adminUpdateNotificationStatus,
} from "@/apis/NotificationAPI";

export default function NotificationManagement() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");

  const [status, setStatus] = useState("");
  const [isBroadcast, setIsBroadcast] = useState("");
  const [search, setSearch] = useState("");
  const [targetUser, setTargetUser] = useState("");

  const filters = useMemo(() => {
    const f = {};
    if (status) f.status = status;
    if (isBroadcast !== "") f.isBroadcast = isBroadcast === "true";
    if (search.trim()) f.search = search.trim();
    if (targetUser.trim()) f.targetUser = targetUser.trim();
    return f;
  }, [status, isBroadcast, search, targetUser]);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);

      const list = await adminGetAllNotifications(filters);
      console.log("Fetched notifications:", list);
      const sorted = (Array.isArray(list) ? list : []).slice().sort((a, b) => {
        const ida = Number(
          a?.notificationId ?? a?.notification_id ?? a?.id ?? 0,
        );
        const idb = Number(
          b?.notificationId ?? b?.notification_id ?? b?.id ?? 0,
        );
        return idb - ida;
      });

      setItems(sorted);
    } catch (e) {
      setErr(e?.message || "Load notifications failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isBroadcast]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      setErr("");
      setBusyId(id);
      await adminUpdateNotificationStatus(id, nextStatus);
      await load();
    } catch (e) {
      setErr(e?.message || "Update status failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setErr("");
      setBusyId(id);
      await adminDeleteNotification(id);
      await load();
    } catch (e) {
      setErr(e?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      {/* HEADER – giống HotelManagement */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Notification management</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/notifications/new")}
            className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
          >
            + Add Notification
          </button>

          <button
            onClick={load}
            className="px-5 py-2 rounded-full ring-1 ring-gray-200 hover:bg-gray-50 transition"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-orange-300"
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">Đang kích hoạt</option>
              <option value="NOT ACTIVE">Không kích hoạt</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Loại
            </label>
            <select
              value={isBroadcast}
              onChange={(e) => setIsBroadcast(e.target.value)}
              className="w-full rounded-xl ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-orange-300"
            >
              <option value="">Tất cả</option>
              <option value="true">Broadcast</option>
              <option value="false">Specific</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo message..."
              className="w-full rounded-xl ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-orange-300"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tìm người nhận
            </label>
            <input
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              placeholder="Username người nhận..."
              className="w-full rounded-xl ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-orange-300"
            />
          </div>

          <div className="md:col-span-12 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTargetUser("");
                setStatus("");
                setIsBroadcast("");
              }}
              className="px-5 py-2 rounded-full ring-1 ring-gray-200 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Xóa
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
              disabled={loading}
            >
              Áp dụng
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 ring-1 ring-red-200 rounded-xl px-3 py-2">
            {err}
          </div>
        )}
      </form>

      {/* LIST */}
      {loading ? (
        <p className="text-center py-10">Loading notifications...</p>
      ) : items.length === 0 ? (
        <p className="text-center py-10 text-gray-500">
          No notifications found.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {items.map((n) => {
            const id = n?.notificationId ?? n?.notification_id ?? n?.id;
            return (
              <div key={id} className={busyId === id ? "opacity-70" : ""}>
                <AdminNotificationCard
                  notif={n}
                  onToggleActive={(nid, s) => handleUpdateStatus(nid, s)}
                  onDelete={(nid) => handleDelete(nid)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
