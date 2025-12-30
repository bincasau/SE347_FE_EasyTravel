import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Logo from "@/assets/images/logo.png";
import { getAccountDetail, logout } from "@/apis/AccountAPI";
import { getUserFromToken } from "@/utils/auth";

export default function Header({ onOpenLogin, onOpenSignup }) {
  const { lang, setLang, t } = useLang();
  const [openLang, setOpenLang] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ prevent redirect loop
  const didRedirectRef = useRef(false);

  const userMenu = [
    { to: "/", key: "home" },
    { to: "/tours", key: "tours" },
    { to: "/hotels", key: "hotel" },
    { to: "/blog", key: "blog" },
    { to: "/about-us", key: "about" },
    { to: "/contact-us", key: "contact" },
  ];

  const guideMenu = [
    { to: "/guide/schedule", label: "Schedule" },
    { to: "/guide/available-days", label: "Days Available" },
    { to: "/guide/past-tours", label: "Past Tours" },
  ];

  const adminMenu = [
    { to: "/admin/dashboard", key: "dashboard" },
    { to: "/admin/tours", key: "tours" },
    { to: "/admin/guides", key: "tourguide" },
    { to: "/admin/hotels", key: "hotel" },
    { to: "/admin/blogs", key: "blog" },
  ];

  // ✅ HOTEL_MANAGER menu (English)
  const hotelManagerMenu = [
    { to: "/hotel-manager/rooms/new", label: "Add Room" },
    { to: "/hotel-manager/hotels", label: "My Hotels" },
    { to: "/hotel-manager/revenue", label: "Hotel Revenue" },
    { to: "/hotel-manager/reports/revenue", label: "Revenue Reports" },
  ];

  const fetchUser = async () => {
    setLoadingUser(true);
    const jwtUser = getUserFromToken();

    try {
      const apiUser = await getAccountDetail();

      setUser({
        name: apiUser.name,
        avatar: apiUser.avatar
          ? `/images/Users/${apiUser.avatar}`
          : "/images/Users/default-avatar.png",
        role: jwtUser?.role || null,
      });
    } catch {
      setUser(null);
    }

    setLoadingUser(false);
  };

  useEffect(() => {
    fetchUser();

    const handleJWT = () => fetchUser();
    window.addEventListener("jwt-changed", handleJWT);
    window.addEventListener("storage", (e) => {
      if (e.key === "jwt") fetchUser();
    });

    return () => window.removeEventListener("jwt-changed", handleJWT);
  }, []);

  // ✅ auto redirect by role
  useEffect(() => {
    if (!user?.role) return;

    if (user.role === "ADMIN") {
      if (!location.pathname.startsWith("/admin")) {
        navigate("/admin/dashboard", { replace: true });
      }
      return;
    }

    if (user.role === "HOTEL_MANAGER") {
      if (didRedirectRef.current) return;

      // ✅ go straight to Add Room
      if (location.pathname !== "/hotel-manager/rooms/new") {
        didRedirectRef.current = true;
        navigate("/hotel-manager/rooms/new", { replace: true });
        return;
      }

      didRedirectRef.current = true;
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    const openLoginHandler = () => {
      if (typeof onOpenLogin === "function") onOpenLogin();
    };

    window.addEventListener("open-login", openLoginHandler);
    return () => window.removeEventListener("open-login", openLoginHandler);
  }, [onOpenLogin]);

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

  const isToursActive =
    location.pathname.startsWith("/tours") ||
    location.pathname.startsWith("/detailtour");

  const isHotelActive =
    location.pathname.startsWith("/hotels") ||
    location.pathname.startsWith("/rooms");

  const isBlogActive =
    location.pathname.startsWith("/blog") ||
    location.pathname.startsWith("/detailblog");

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
            className={({ isActive }) => (isActive ? activeLink : baseLink)}
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
            className={({ isActive }) => (isActive ? activeLink : baseLink)}
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

  const goToProfileByRole = () => {
    navigate(
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : user.role === "HOTEL_MANAGER"
        ? "/hotel-manager/rooms/new"
        : user.role === "TOUR_GUIDE"
        ? "/guide/profile"
        : "/profile"
    );
  };

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
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
                  {t("header.logout")}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenLogin()}
                  className="border border-orange-500 text-orange-600 px-4 py-2 rounded-full hover:bg-orange-50"
                >
                  {t("header.login")}
                </button>
                <button
                  onClick={() => onOpenSignup()}
                  className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-400 shadow"
                >
                  {t("header.signup")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
