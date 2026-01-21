import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { getMyNotifications, getPublicNotifications, markNotificationRead } from "@/apis/NotificationAPI";

export default function NotificationPanel({ user, loadingNoti, setLoadingNoti }) {
  const [openNoti, setOpenNoti] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notiRef = useRef(null);

  const normalizeNoti = (n) => ({
    ...n,
    read: n.read ?? n.isRead ?? false,
  });

  const sortNoti = (arr) =>
    [...arr].sort((a, b) => {
      const ta = new Date(a.time || a.createdAt || a.updatedAt).getTime();
      const tb = new Date(b.time || b.createdAt || b.updatedAt).getTime();
      return (tb || 0) - (ta || 0);
    });

  const unreadCount = notifications.filter((n) => !normalizeNoti(n).read).length;
  const showBadge = !!user && unreadCount > 0;

  /**
   * ✅ CHỈNH THEO YÊU CẦU:
   * - CUSTOMER: KHÔNG lấy broadcast/public
   * - Role khác: có broadcast/public
   * - Luôn lấy MY notifications nếu đã login
   * - Merge theo id, giữ read state
   */
  const loadNotifications = useCallback(async () => {
    setLoadingNoti(true);
    try {
      // ✅ CUSTOMER thì ẩn broadcast/public trong chuông
      const includePublic = user?.role && user.role !== "CUSTOMER";

      const [publicList, myList] = await Promise.all([
        includePublic
          ? getPublicNotifications().catch(() => [])
          : Promise.resolve([]),
        user ? getMyNotifications("ACTIVE").catch(() => []) : Promise.resolve([]),
      ]);

      const incoming = [
        ...(Array.isArray(publicList) ? publicList : []),
        ...(Array.isArray(myList) ? myList : []),
      ].map(normalizeNoti);

      // merge by id + keep read state
      setNotifications((prev) => {
        const prevMap = new Map(prev.map((x) => [x.id, normalizeNoti(x)]));
        const mergedMap = new Map();

        const put = (n) => {
          if (!n?.id) return;
          const old = mergedMap.get(n.id);
          const oldPrev = prevMap.get(n.id);

          if (!old) {
            mergedMap.set(n.id, {
              ...n,
              read: Boolean(oldPrev?.read) || Boolean(n.read),
            });
            return;
          }

          // nếu trùng id (có thể public/my) => merge lại
          mergedMap.set(n.id, {
            ...old,
            ...n,
            read: Boolean(old.read) || Boolean(n.read) || Boolean(oldPrev?.read),
          });
        };

        incoming.forEach(put);

        return sortNoti(Array.from(mergedMap.values()));
      });
    } catch (e) {
      console.error("Load notifications failed:", e);
      setNotifications([]);
    }
    setLoadingNoti(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notiRef.current && !notiRef.current.contains(e.target))
        setOpenNoti(false);
    };

    if (openNoti) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openNoti]);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, loadNotifications]);

  const handleClickNoti = async (n) => {
    const nn = normalizeNoti(n);

    if (!user) {
      setNotifications((prev) =>
        prev.map((x) => (x.id === nn.id ? { ...x, read: true } : x))
      );
      return;
    }

    if (!nn.read) {
      try {
        await markNotificationRead(nn.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === nn.id ? { ...x, read: true } : x))
        );
      } catch (e) {
        console.error("Mark read failed:", e);
      }
    }
  };

  const markAllRead = async () => {
    if (!user) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      return;
    }

    const unread = notifications.map(normalizeNoti).filter((n) => !n.read);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    } catch (e) {
      console.error("Mark all read failed:", e);
      await loadNotifications();
    }
  };

  // Only render if user is logged in
  if (!user) return null;

  return (
    <div className="relative" ref={notiRef}>
      <button
        onClick={async () => {
          const next = !openNoti;
          setOpenNoti(next);
          if (next) await loadNotifications();
        }}
        className="relative w-10 h-10 grid place-items-center rounded-full border bg-white hover:bg-gray-50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-900" />

        {showBadge && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-red-500 text-white grid place-items-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {openNoti && (
        <div className="absolute right-0 mt-2 w-[min(360px,calc(100vw-16px))] bg-white border rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b">
            <div className="font-semibold">Notifications</div>
            <button
              onClick={markAllRead}
              className="text-sm text-orange-600 hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-[360px] overflow-auto">
            {loadingNoti ? (
              <div className="p-6 text-gray-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-gray-500 text-sm">
                No notifications.
              </div>
            ) : (
              notifications.map((n) => {
                const nn = normalizeNoti(n);
                return (
                  <button
                    key={nn.id}
                    onClick={() => handleClickNoti(nn)}
                    className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ${
                      nn.read ? "opacity-80" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 w-2.5 h-2.5 rounded-full ${
                          nn.read ? "bg-gray-300" : "bg-orange-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium truncate">
                            {nn.title}
                          </div>
                          <div className="text-xs text-gray-400 shrink-0">
                            {nn.time}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {nn.message}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-3 border-t bg-gray-50 flex justify-end">
            <button
              onClick={() => setOpenNoti(false)}
              className="text-sm text-gray-600 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NotificationPanelMobile({ user, loadingNoti, setLoadingNoti }) {
  const [openNoti, setOpenNoti] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const normalizeNoti = (n) => ({
    ...n,
    read: n.read ?? n.isRead ?? false,
  });

  const sortNoti = (arr) =>
    [...arr].sort((a, b) => {
      const ta = new Date(a.time || a.createdAt || a.updatedAt).getTime();
      const tb = new Date(b.time || b.createdAt || b.updatedAt).getTime();
      return (tb || 0) - (ta || 0);
    });

  const unreadCount = notifications.filter((n) => !normalizeNoti(n).read).length;
  const showBadge = !!user && unreadCount > 0;

  const loadNotifications = useCallback(async () => {
    setLoadingNoti(true);
    try {
      const includePublic = user?.role && user.role !== "CUSTOMER";

      const [publicList, myList] = await Promise.all([
        includePublic
          ? getPublicNotifications().catch(() => [])
          : Promise.resolve([]),
        user ? getMyNotifications("ACTIVE").catch(() => []) : Promise.resolve([]),
      ]);

      const incoming = [
        ...(Array.isArray(publicList) ? publicList : []),
        ...(Array.isArray(myList) ? myList : []),
      ].map(normalizeNoti);

      setNotifications((prev) => {
        const prevMap = new Map(prev.map((x) => [x.id, normalizeNoti(x)]));
        const mergedMap = new Map();

        const put = (n) => {
          if (!n?.id) return;
          const old = mergedMap.get(n.id);
          const oldPrev = prevMap.get(n.id);

          if (!old) {
            mergedMap.set(n.id, {
              ...n,
              read: Boolean(oldPrev?.read) || Boolean(n.read),
            });
            return;
          }

          mergedMap.set(n.id, {
            ...old,
            ...n,
            read: Boolean(old.read) || Boolean(n.read) || Boolean(oldPrev?.read),
          });
        };

        incoming.forEach(put);

        return sortNoti(Array.from(mergedMap.values()));
      });
    } catch (e) {
      console.error("Load notifications failed:", e);
      setNotifications([]);
    }
    setLoadingNoti(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, loadNotifications]);

  const handleClickNoti = async (n) => {
    const nn = normalizeNoti(n);

    if (!user) {
      setNotifications((prev) =>
        prev.map((x) => (x.id === nn.id ? { ...x, read: true } : x))
      );
      return;
    }

    if (!nn.read) {
      try {
        await markNotificationRead(nn.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === nn.id ? { ...x, read: true } : x))
        );
      } catch (e) {
        console.error("Mark read failed:", e);
      }
    }
  };

  const markAllRead = async () => {
    if (!user) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      return;
    }

    const unread = notifications.map(normalizeNoti).filter((n) => !n.read);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    } catch (e) {
      console.error("Mark all read failed:", e);
      await loadNotifications();
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={async () => {
          const next = !openNoti;
          setOpenNoti(next);
          if (next) await loadNotifications();
        }}
        className="w-full flex items-center justify-between rounded-xl border px-3 py-2 hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <span className="text-sm">Notifications</span>
        </div>

        {showBadge ? (
          <span className="min-w-[22px] h-[22px] px-1 text-[12px] rounded-full bg-red-500 text-white grid place-items-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : (
          <span className="text-xs text-gray-500">›</span>
        )}
      </button>

      {openNoti && (
        <div className="border rounded-2xl overflow-hidden">
          <div className="px-3 py-2 flex items-center justify-between border-b bg-gray-50">
            <div className="font-semibold text-sm">Notifications</div>
            <button
              onClick={markAllRead}
              className="text-sm text-orange-600 hover:underline"
            >
              Mark all
            </button>
          </div>

          <div className="max-h-[45vh] overflow-auto">
            {loadingNoti ? (
              <div className="p-4 text-gray-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">
                No notifications.
              </div>
            ) : (
              notifications.map((n) => {
                const nn = normalizeNoti(n);
                return (
                  <button
                    key={nn.id}
                    onClick={() => handleClickNoti(nn)}
                    className={`w-full text-left px-3 py-3 border-b last:border-b-0 hover:bg-gray-50 ${
                      nn.read ? "opacity-80" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 w-2.5 h-2.5 rounded-full ${
                          nn.read ? "bg-gray-300" : "bg-orange-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium truncate">
                            {nn.title}
                          </div>
                          <div className="text-xs text-gray-400 shrink-0">
                            {nn.time}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {nn.message}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-3 py-2 border-t bg-gray-50 flex justify-end">
            <button
              onClick={() => setOpenNoti(false)}
              className="text-sm text-gray-600 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
