import { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Logo from "@/assets/images/logo.png";

const API_BASE = "http://localhost:8080";

export default function Header({ onOpenLogin }) {
  const { lang, setLang, t } = useLang();
  const [openLang, setOpenLang] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Danh sách nav
  const navItems = useMemo(
    () => [
      { to: "/", key: "home" },
      { to: "/tours", key: "tours" },
      { to: "/hotel", key: "hotel" },
      { to: "/blog", key: "blog" },
      { to: "/about-us", key: "about" },
      { to: "/contact-us", key: "contact" },
    ],
    []
  );

  // Fetch user detail từ backend
  const fetchMe = async () => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      setLoadingUser(true);
      const res = await fetch(`${API_BASE}/account/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("unauthorized");
      const data = await res.json();
      setUser({
        name: data.name || "User",
        avatar: data.avatar
          ? `/images/Users/${data.avatar}`
          : `https://ui-avatars.com/api/?background=FFEDD5&color=F97316&name=${encodeURIComponent(
              data.name || "U"
            )}`,
      });
    } catch (e) {
      localStorage.removeItem("jwt");
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchMe(); // Fetch 1 lần khi load trang
    const onJwtChanged = () => fetchMe();
    window.addEventListener("jwt-changed", onJwtChanged);
    const onStorage = (e) => {
      if (e.key === "jwt") fetchMe();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("jwt-changed", onJwtChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const handleLogout = () => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (!confirmed) return;
    localStorage.removeItem("jwt");
    setUser(null);
    window.dispatchEvent(new Event("jwt-changed"));
    navigate("/");
  };

  const Flag = ({ code }) => (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-base leading-none">
        {code === "vi" ? "🇻🇳" : "🇺🇸"}
      </span>
      <span className="uppercase">{code}</span>
    </div>
  );

  const baseLink =
    "text-gray-700 hover:text-orange-500 transition-colors relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-0 after:bg-orange-500 hover:after:w-full after:transition-all";
  const activeLink =
    "text-orange-500 relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-orange-500";

  const isToursActive =
    location.pathname.startsWith("/tours") ||
    location.pathname.startsWith("/detailtours") ||
    location.pathname.startsWith("/booking");

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={Logo} alt="EasyTravel" className="h-9 w-auto" />
            <span className="text-2xl font-semibold text-orange-500">Easy</span>
            <span className="text-2xl font-semibold text-gray-900 -ml-2">
              Travel
            </span>
          </Link>
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center gap-9">
              {navItems.map((it) => (
                <li key={it.key}>
                  <NavLink
                    to={it.to}
                    end={it.to === "/"}
                    className={({ isActive }) => {
                      if (it.to === "/tours" && isToursActive)
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
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <div className="relative">
              <button
                onClick={() => setOpenLang((v) => !v)}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200"
              >
                <Flag code={lang} />
              </button>
              {openLang && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                    onClick={() => {
                      setLang("vi");
                      setOpenLang(false);
                    }}
                  >
                    <Flag code="vi" />
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
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
              <div className="h-10 inline-flex items-center px-3 text-gray-400 text-sm">
                Loading...
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span
                  className="font-medium text-gray-800 truncate max-w-[120px] md:max-w-[160px] lg:max-w-[200px] flex-1"
                  title={user.name}
                >
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 rounded-full border border-red-400 text-red-500 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenLogin?.()}
                  className="inline-flex h-10 items-center justify-center px-4 rounded-full border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  {t("header.login")}
                </button>
                <Link
                  to="/sign-up"
                  className="inline-flex h-10 items-center justify-center px-5 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-400 transition-colors shadow-sm"
                >
                  {t("header.signup")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
