import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNotificationCard from "@/components/pages/Admin/Notification/AdminNotificationCard";
import {
  adminGetAllNotifications,
  adminDeleteNotification,
  adminUpdateNotificationStatus,
} from "@/apis/NotificationAPI";

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
  );
}

// ✅ helper pages hiển thị gọn
function getVisiblePages(page, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  if (page === 1) return [1, 2, 3];
  if (page === 2) return [1, 2, 3, 4];
  if (page === 3) return [1, 2, 3, 4, 5];

  if (page === total) return [total - 2, total - 1, total];
  if (page === total - 1) return [total - 3, total - 2, total - 1, total];
  if (page === total - 2)
    return [total - 4, total - 3, total - 2, total - 1, total];

  const start = Math.max(1, page - 2);
  const end = Math.min(total, page + 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

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

  // ✅ Pagination
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const filters = useMemo(() => {
    const f = {};
    if (status) f.status = status;
    if (isBroadcast !== "") f.isBroadcast = isBroadcast === "true";
    if (search.trim()) f.search = search.trim();
    if (targetUser.trim()) f.targetUser = targetUser.trim();
    return f;
  }, [status, isBroadcast, search, targetUser]);

  const load = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);

      const list = await adminGetAllNotifications(filters);
      console.log("Fetched notifications:", list);

      const sorted = (Array.isArray(list) ? list : []).slice().sort((a, b) => {
        const ida = Number(a?.notificationId ?? a?.notification_id ?? a?.id ?? 0);
        const idb = Number(b?.notificationId ?? b?.notification_id ?? b?.id ?? 0);
        return idb - ida;
      });

      setItems(sorted);
      setCurrentPage(1); // ✅ mỗi lần load lại thì về trang 1
    } catch (e) {
      setErr(e?.message || "Load notifications failed");
      setItems([]);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // auto load khi đổi status/isBroadcast (giữ hành vi của bạn)
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isBroadcast]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(); // load có setCurrentPage(1)
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

      // ✅ xoá xong: update local cho mượt + chỉnh trang nếu bị hụt
      setItems((prev) => prev.filter((x) => (x?.notificationId ?? x?.notification_id ?? x?.id) !== id));
    } catch (e) {
      setErr(e?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setTargetUser("");
    setStatus("");
    setIsBroadcast("");
    setCurrentPage(1);
  };

  // ✅ Total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / pageSize));
  }, [items.length]);

  // ✅ nếu currentPage vượt totalPages (sau khi xoá) thì kéo lại
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // ✅ Items theo trang
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage]);

  const visiblePages = useMemo(() => {
    return getVisiblePages(currentPage, totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">
            Notification management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Lọc, tìm kiếm và quản lý thông báo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/admin/notifications/new")}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition"
          >
            Thêm thông báo
          </button>

          <button
            onClick={load}
            className="w-full sm:w-auto px-5 py-2 rounded-full ring-1 ring-gray-200 hover:bg-gray-50 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Spinner /> : null}
            Làm mới
          </button>
        </div>
      </div>

      {/* FILTER BAR responsive */}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {/* Actions: stack mobile */}
          <div className="md:col-span-12 flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full sm:w-auto px-5 py-2 rounded-full ring-1 ring-gray-200 hover:bg-gray-50 transition disabled:opacity-60"
              disabled={loading}
            >
              Xóa
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <Spinner /> : null}
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
        <div className="py-10 flex items-center justify-center gap-3 text-gray-600">
          <Spinner />
          Loading notifications...
        </div>
      ) : items.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No notifications found.</p>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:gap-5">
            {pagedItems.map((n) => {
              const id = n?.notificationId ?? n?.notification_id ?? n?.id;
              const isBusy = busyId === id;

              return (
                <div
                  key={id}
                  className={isBusy ? "opacity-70 pointer-events-none" : ""}
                >
                  <AdminNotificationCard
                    notif={n}
                    onToggleActive={(nid, s) => handleUpdateStatus(nid, s)}
                    onDelete={(nid) => handleDelete(nid)}
                  />
                </div>
              );
            })}
          </div>

          {/* ✅ Pagination */}
          {items.length > pageSize && (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {visiblePages[0] > 1 && (
                  <>
                    <button
                      className={`px-3 py-2 rounded-lg border hover:bg-gray-50 ${
                        currentPage === 1 ? "bg-gray-100" : ""
                      }`}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                    <span className="px-1 text-gray-400">...</span>
                  </>
                )}

                {visiblePages.map((p) => (
                  <button
                    key={p}
                    className={`px-3 py-2 rounded-lg border hover:bg-gray-50 ${
                      currentPage === p ? "bg-orange-500 text-white border-orange-500" : ""
                    }`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}

                {visiblePages[visiblePages.length - 1] < totalPages && (
                  <>
                    <span className="px-1 text-gray-400">...</span>
                    <button
                      className={`px-3 py-2 rounded-lg border hover:bg-gray-50 ${
                        currentPage === totalPages ? "bg-gray-100" : ""
                      }`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
