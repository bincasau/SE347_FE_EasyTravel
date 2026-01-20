import { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const isTours =
      matchPath({ path: "/tours", end: true }, pathname) ||
      matchPath({ path: "/detailtour/:slugId", end: true }, pathname);

    // scroll ngay lập tức
    window.scrollTo({ top: 0, left: 0, behavior: isTours ? "auto" : "smooth" });

    // ✅ Fix riêng cho Tour: render lại / ảnh load / layout shift
    // chạy thêm 1 lần ở frame kế tiếp để chắc chắn về top
    if (isTours) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });

      // nếu trang có ảnh load chậm, thêm 1 tick nữa
      const t = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }, 50);

      return () => clearTimeout(t);
    }
  }, [pathname, search, hash]);

  return null;
}
