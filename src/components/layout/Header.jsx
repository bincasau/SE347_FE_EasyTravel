import { useMemo, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Logo from "@/assets/images/logo.png";

const Header = () => {
  const { lang, setLang, t } = useLang();
  const [openMenu, setOpenMenu] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const location = useLocation();

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

  // ✅ Tự nhận diện route chi tiết của tour
  const isToursActive =
    location.pathname.startsWith("/tours") ||
    location.pathname.startsWith("/detailtours")||
    location.pathname.startsWith("/booking");

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            onClick={() => setOpenMenu(false)}
          >
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
                      // ✅ nếu là mục "Tours" → tô màu cả khi ở /detailtours
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

            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center px-4 rounded-full border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors"
            >
              {t("header.login")}
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-10 items-center justify-center px-5 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-400 transition-colors shadow-sm"
            >
              {t("header.signup")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
