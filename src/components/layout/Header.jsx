import { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Logo from "@/assets/images/logo.png";
import { getAccountDetail, logout } from "@/apis/AccountAPI";

export default function Header({ onOpenLogin, onOpenSignup }) {
  const { lang, setLang, t } = useLang();
  const [openLang, setOpenLang] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const navItems = useMemo(
    () => [
      { to: "/", key: "home" },
      { to: "/tours", key: "tours" },
      { to: "/hotels", key: "hotel" },
      { to: "/blog", key: "blog" },
      { to: "/about-us", key: "about" },
      { to: "/contact-us", key: "contact" },
    ],
    []
  );

  /** FETCH USER */
  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const data = await getAccountDetail();

      setUser({
        name: data.name || "User",
        avatar: data.avatar
          ? `/images/Users/${data.avatar}`
          : "/images/Users/default-avatar.png",
      });
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const handle = () => fetchUser();

    window.addEventListener("jwt-changed", handle);
    window.addEventListener("storage", (e) => {
      if (e.key === "jwt") fetchUser();
    });

    return () => window.removeEventListener("jwt-changed", handle);
  }, []);

  const handleLogout = () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
    logout();
    setUser(null);
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
    "text-orange-500 relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-orange-500";

  const isToursActive =
    location.pathname.startsWith("/tours") ||
    location.pathname.startsWith("/detailtour");

  const isHotelActive =
    location.pathname.startsWith("/hotel") ||
    location.pathname.startsWith("/rooms");

  const isBlogActive =
    location.pathname.startsWith("/blog") ||
    location.pathname.startsWith("/detailblog");

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={Logo} className="h-9" />
            <span className="text-2xl font-semibold text-orange-500">Easy</span>
            <span className="text-2xl font-semibold text-gray-900 -ml-2">
              Travel
            </span>
          </Link>

          {/* NAV */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-9">
              {navItems.map((it) => (
                <li key={it.key}>
                  <NavLink
                    to={it.to}
                    end={it.to === "/"}
                    className={({ isActive }) => {
                      if (it.to === "/tours" && isToursActive)
                        return `${activeLink} font-medium`;
                      if (it.to === "/hotel" && isHotelActive)
                        return `${activeLink} font-medium`;
                      if (it.to === "/blog" && isBlogActive)
                        return `${activeLink} font-medium`;
                      return `${isActive ? activeLink : baseLink} font-medium`;
                    }}
                  >
                    {t(`header.${it.key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User / Auth */}
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

            {/* USER */}
            {loadingUser ? (
              <div className="text-gray-400">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/profile")}
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
