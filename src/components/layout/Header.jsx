import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Logo from "@/assets/images/logo.png";
import { getAccountDetail, logout } from "@/apis/AccountAPI";
import { getUserFromToken } from "@/utils/auth";
import { Bell } from "lucide-react";

import {
  getMyNotifications,
  getPublicNotifications,
  markNotificationRead,
} from "@/apis/NotificationAPI";

const S3_USER_BASE =
  "https://s3.ap-southeast-2.amazonaws.com/aws.easytravel/user";

export default function Header({ onOpenLogin, onOpenSignup }) {
  const { lang, setLang, t } = useLang();
  const [openLang, setOpenLang] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // prevent redirect loop (chỉ dùng cho root redirect)
  const didRedirectRef = useRef(false);

  // 🔔 Notifications
  const [openNoti, setOpenNoti] = useState(false);
  const notiRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNoti, setLoadingNoti] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const userMenu = [
    { to: "/", key: "home" },
    { to: "/tours", key: "tours" },
    { to: "/hotels", key: "hotel" },
    { to: "/blog", key: "blog" },
    { to: "/about-us", key: "about" },
    { to: "/contact-us", key: "contact" },
  ];

  const guideMenu = [
    { to: "/guide/schedule", label: "Tour Schedule" },
    { to: "/guide/available-days", label: "Days Available" },
    { to: "/guide/past-tours", label: "Past Tours" },
  ];

  const adminMenu = [
    { to: "/admin/dashboard", key: "dashboard" },
    { to: "/admin/tours", key: "tours" },
    { to: "/admin/users", key: "users" },
    { to: "/admin/hotels", key: "hotel" },
    { to: "/admin/blogs", key: "blog" },
  ];

  const hotelManagerMenu = [
    { to: "/hotel-manager/hotels/addroom", label: "Add Rooms" },
    { to: "/hotel-manager/revenue", label: "Hotel Revenue" },
    { to: "/hotel-manager/reports/revenue", label: "Revenue Reports" },
    { to: "/hotel-manager/myhotel", label: "My Hotel" },
  ];

  const fetchUser = async () => {
    setLoadingUser(true);
    const jwtUser = getUserFromToken();

    try {
      const apiUser = await getAccountDetail();

      setUser({
        name: apiUser.name,
        avatar: apiUser.avatar
          ? `${S3_USER_BASE}/${apiUser.avatar}`
          : `${S3_USER_BASE}/user_default.jpg`,
        role: jwtUser?.role || null,
      });
    } catch {
      setUser(null);
    }

    setLoadingUser(false);
  };

  // 🔔 load notifications
  const loadNotifications = async () => {
    setLoadingNoti(true);
    try {
      const data = user
        ? await getMyNotifications("ACTIVE")
        : await getPublicNotifications();

      // sort mới nhất lên đầu nếu createdAt là string ISO
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const ta = new Date(a.time).getTime();
            const tb = new Date(b.time).getTime();
            return (tb || 0) - (ta || 0);
          })
        : [];

      setNotifications(sorted);
    } catch (e) {
      console.error("Load notifications failed:", e);
      setNotifications([]);
    }
    setLoadingNoti(false);
  };

  useEffect(() => {
    fetchUser();

    const handleJWT = () => fetchUser();
    window.addEventListener("jwt-changed", handleJWT);

    const storageHandler = (e) => {
      if (e.key === "jwt") fetchUser();
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("jwt-changed", handleJWT);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  // khi user thay đổi -> load lại noti
  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ✅ auto redirect by role (redirect ONLY on root pages)
  useEffect(() => {
    if (!user?.role) return;

    // ✅ Admin redirect
    if (user.role === "ADMIN") {
      if (!location.pathname.startsWith("/admin")) {
        navigate("/admin/dashboard", { replace: true });
      }
      return;
    }

    // ✅ Hotel manager: chỉ redirect khi đứng đúng ROOT /hotel-manager
    if (user.role === "HOTEL_MANAGER") {
      const isHotelManagerRoot =
        location.pathname === "/hotel-manager" ||
        location.pathname === "/hotel-manager/";

      if (isHotelManagerRoot && !didRedirectRef.current) {
        didRedirectRef.current = true;
        navigate("/hotel-manager/hotels/addroom", { replace: true });
      }
      return;
    }

    // ✅ Tour guide: chỉ redirect khi đứng đúng ROOT /guide
    if (user.role === "TOUR_GUIDE") {
      const isGuideRoot =
        location.pathname === "/guide" || location.pathname === "/guide/";

      if (isGuideRoot && !didRedirectRef.current) {
        didRedirectRef.current = true;
        navigate("/guide/schedule", { replace: true });
      }
      return;
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    const openLoginHandler = () => {
      if (typeof onOpenLogin === "function") onOpenLogin();
    };

    window.addEventListener("open-login", openLoginHandler);
    return () => window.removeEventListener("open-login", openLoginHandler);
  }, [onOpenLogin]);

  // 🔔 close notifications dropdown when click outside / ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (!notiRef.current) return;
      if (!notiRef.current.contains(e.target)) setOpenNoti(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpenNoti(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleLogout = () => {
    if (!confirm("Bạn có chắc muốn đăng xuất?")) return;
    logout();
    setUser(null);
    didRedirectRef.current = false;
    navigate("/");
  };

  const Flag = ({ code }) => (
    <div className="flex items-center gap-1 text-sm">
      <span>{code === "vi" ? "🇻🇳" : "🇺🇸"}</span>
      <span className="uppercase">{code}</span>
    </div>
  );

  const baseLink =
    "text-gray-700 hover:text-orange-500 transition-colors relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-0 after:bg-orange-500 hover:after:w-full after:transition-all";

  const activeLink =
    "text-orange-500 font-semibold relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-orange-500";

  // ✅ FIX: booking vẫn active Tours
  const isToursActive =
    location.pathname.startsWith("/tours") ||
    location.pathname.startsWith("/detailtour") ||
    /^\/booking(\/|$)/.test(location.pathname);

  const isHotelActive =
    location.pathname.startsWith("/hotels") ||
    location.pathname.startsWith("/rooms");

  const isBlogActive =
    location.pathname.startsWith("/blog") ||
    location.pathname.startsWith("/detailblog");

  const isGuideScheduleActive =
    location.pathname.startsWith("/guide/schedule") ||
    /^\/guide\/tour\/[^/]+\/schedule\/?$/.test(location.pathname);

  const isGuidePastToursActive =
    location.pathname.startsWith("/guide/past-tours") ||
    location.pathname.startsWith("/detailtour");

  const isHotelManagerAddRoomActive =
    location.pathname.startsWith("/hotel-manager/hotels/addroom") ||
    location.pathname.startsWith("/hotel-manager/rooms/edit") ||
    location.pathname.startsWith("/hotel-manager/rooms/view");

  const isHotelManagerRevenueActive =
    location.pathname.startsWith("/hotel-manager/revenue");

  const renderNavClass = (it, isActive) => {
    if (it.to === "/tours" && isToursActive) return activeLink;
    if (it.to === "/hotels" && isHotelActive) return activeLink;
    if (it.to === "/blog" && isBlogActive) return activeLink;
    return isActive ? activeLink : baseLink;
  };

  const renderMenu = () => {
    if (user?.role === "ADMIN") {
      return adminMenu.map((it) => (
        <li key={it.to}>
          <NavLink
            to={it.to}
            end
            className={({ isActive }) => renderNavClass(it, isActive)}
          >
            {t(`header.${it.key}`)}
          </NavLink>
        </li>
      ));
    }

    if (user?.role === "HOTEL_MANAGER") {
      return hotelManagerMenu.map((it) => (
        <li key={it.to}>
          <NavLink
            to={it.to}
            end
            className={({ isActive }) => {
              if (
                it.to === "/hotel-manager/hotels/addroom" &&
                isHotelManagerAddRoomActive
              )
                return activeLink;

              if (
                it.to === "/hotel-manager/revenue" &&
                isHotelManagerRevenueActive
              )
                return activeLink;

              return isActive ? activeLink : baseLink;
            }}
          >
            {it.label}
          </NavLink>
        </li>
      ));
    }

    if (user?.role === "TOUR_GUIDE") {
      return guideMenu.map((it) => (
        <li key={it.to}>
          <NavLink
            to={it.to}
            end
            className={({ isActive }) => {
              if (it.to === "/guide/schedule" && isGuideScheduleActive)
                return activeLink;

              if (it.to === "/guide/past-tours" && isGuidePastToursActive)
                return activeLink;

              return isActive ? activeLink : baseLink;
            }}
          >
            {it.label}
          </NavLink>
        </li>
      ));
    }

    return userMenu.map((it) => (
      <li key={it.key}>
        <NavLink
          to={it.to}
          end={it.to === "/"}
          className={({ isActive }) => renderNavClass(it, isActive)}
        >
          {t(`header.${it.key}`)}
        </NavLink>
      </li>
    ));
  };

  // ✅ Avatar click => luôn về /profile cho mọi role
  const goToProfileByRole = () => navigate("/profile");

  // ✅ LOGO: đi theo role
  const getHomeByRole = () => {
    if (!user?.role) return "/";

    switch (user.role) {
      case "ADMIN":
        return "/admin/dashboard";
      case "HOTEL_MANAGER":
        return "/hotel-manager/hotels/addroom";
      case "TOUR_GUIDE":
        return "/guide/schedule";
      default:
        return "/";
    }
  };

  const handleClickNoti = async (n) => {
    // public list không cần patch, my list thì patch
    if (user && !n.read) {
      try {
        await markNotificationRead(n.id);
      } catch (e) {
        console.error("Mark read failed:", e);
      }
    }

    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          <Link to={getHomeByRole()} className="flex items-center gap-2 shrink-0">
            <img src={Logo} className="h-9" alt="logo" />
            <span className="text-2xl font-semibold text-orange-500">Easy</span>
            <span className="text-2xl font-semibold text-gray-900 -ml-2">
              Travel
            </span>
          </Link>

          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-9">{renderMenu()}</ul>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {/* Language */}
            <div className="relative">
              <button
                className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100"
                onClick={() => setOpenLang(!openLang)}
              >
                <Flag code={lang} />
              </button>

              {openLang && (
                <div className="absolute right-0 mt-2 bg-white border w-32 rounded-xl shadow">
                  <button
                    className="flex w-full px-3 py-2 hover:bg-gray-50"
                    onClick={() => {
                      setLang("vi");
                      setOpenLang(false);
                    }}
                  >
                    <Flag code="vi" />
                  </button>
                  <button
                    className="flex w-full px-3 py-2 hover:bg-gray-50"
                    onClick={() => {
                      setLang("en");
                      setOpenLang(false);
                    }}
                  >
                    <Flag code="en" />
                  </button>
                </div>
              )}
            </div>

            {/* 🔔 Notifications */}
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
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-red-500 text-white grid place-items-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {openNoti && (
                <div className="absolute right-0 mt-2 w-[360px] bg-white border rounded-2xl shadow-lg overflow-hidden">
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
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleClickNoti(n)}
                          className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ${
                            n.read ? "opacity-80" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 w-2.5 h-2.5 rounded-full ${
                                n.read ? "bg-gray-300" : "bg-orange-500"
                              }`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-medium">{n.title}</div>
                                <div className="text-xs text-gray-400 shrink-0">
                                  {n.time}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {n.message}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-3 border-t bg-gray-50 flex justify-between">
                    <button
                      onClick={() => setOpenNoti(false)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      View all
                    </button>
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

            {loadingUser ? (
              <div className="text-gray-400">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={goToProfileByRole}
                  className="flex items-center gap-2 group"
                >
                  <img
                    src={user.avatar}
                    className="w-9 h-9 rounded-full border"
                    alt="avatar"
                  />
                  <span className="font-medium group-hover:text-orange-500">
                    {user.name}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="min-w-[110px] border border-red-400 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50"
                >
                  {t("Log Out")}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenLogin()}
                  className="border border-orange-500 text-orange-600 px-4 py-2 rounded-full hover:bg-orange-50"
                >
                  {t("Login")}
                </button>
                <button
                  onClick={() => onOpenSignup()}
                  className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-400 shadow"
                >
                  {t("Sign Up")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
