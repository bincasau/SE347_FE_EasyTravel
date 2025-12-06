import { useEffect, useMemo, useState } from "react";
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

  /** ⭐ MENU USER */
  const userMenu = [
    { to: "/", key: "home" },
    { to: "/tours", key: "tours" },
    { to: "/hotels", key: "hotel" },
    { to: "/blog", key: "blog" },
    { to: "/about-us", key: "about" },
    { to: "/contact-us", key: "contact" },
  ];

  /** ⭐ MENU TOUR GUIDE */
  const guideMenu = [
    { to: "/guide/schedule", label: "Schedule" },
    { to: "/guide/reviews", label: "Guest Reviews" },
    { to: "/guide/past-tours", label: "Past Tours" },
    { to: "/guide/profile", label: "Guide's Profile" },
  ];

  /** FETCH USER + ROLE */
  const fetchUserWithRole = async () => {
    setLoadingUser(true);

    const jwtUser = getUserFromToken(); // chứa role + username

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
    fetchUserWithRole();
    const h = () => fetchUserWithRole();
    window.addEventListener("jwt-changed", h);
    return () => window.removeEventListener("jwt-changed", h);
  }, []);

  /** LOGOUT */
  const handleLogout = () => {
    if (!confirm("Bạn có chắc muốn đăng xuất?")) return;
    logout();
    setUser(null);
    navigate("/");
  };

  const baseLink =
    "text-gray-700 hover:text-orange-500 transition-colors relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-0 after:bg-orange-500 hover:after:w-full after:transition-all";

  const activeLink =
    "text-orange-500 font-semibold relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-orange-500";

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">

          {/* ⭐ LOGO */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={Logo} className="h-9" />
            <span className="text-2xl font-semibold text-orange-500">Easy</span>
            <span className="text-2xl font-semibold text-gray-900 -ml-2">
              Travel
            </span>
          </Link>

          {/* ⭐ MENU Ở GIỮA */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-9">

              {/* Nếu là tourguide → dùng menu guide */}
              {user?.role === "TourGuide"
                ? guideMenu.map((it) => (
                    <li key={it.to}>
                      <NavLink
                        to={it.to}
                        className={({ isActive }) =>
                          isActive ? activeLink : baseLink
                        }
                      >
                        {it.label}
                      </NavLink>
                    </li>
                  ))
                : userMenu.map((it) => (
                    <li key={it.key}>
                      <NavLink
                        to={it.to}
                        end={it.to === "/"}
                        className={({ isActive }) =>
                          isActive ? activeLink : baseLink
                        }
                      >
                        {t(`header.${it.key}`)}
                      </NavLink>
                    </li>
                  ))}
            </ul>
          </nav>

          {/* ⭐ USER INFO / AUTH */}
          <div className="hidden md:flex items-center gap-4">
            {loadingUser ? (
              <div className="text-gray-400">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    navigate(user.role === "TourGuide" ? "/guide/profile" : "/profile")
                  }
                  className="flex items-center gap-2 group"
                >
                  <img
                    src={user.avatar}
                    className="w-9 h-9 rounded-full border"
                  />
                  <span className="font-medium group-hover:text-orange-500">
                    {user.name}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="border border-red-400 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="border border-orange-500 text-orange-600 px-4 py-2 rounded-full hover:bg-orange-50"
                >
                  {t("header.login")}
                </button>
                <button
                  onClick={onOpenSignup}
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
