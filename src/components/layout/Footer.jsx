import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import Logo from "@/assets/images/logo.png";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  const { t } = useLang();

  return (
    <footer className="bg-[#2F2F2F] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={Logo} alt="EasyTravel" className="h-12 sm:h-14 w-auto" />
          <div className="text-xl sm:text-2xl font-semibold leading-tight">
            <span className="text-orange-400">Easy</span>
            <div className="-mt-1">Travel</div>
          </div>
        </div>

        <hr className="border-t border-white/10 mt-6 mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Navigation */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4">
              {t("footer.navigation")}
            </h4>
            <ul className="space-y-3 text-white/90 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-400">
                  {t("header.home")}
                </Link>
              </li>
              <li>
                <Link to="/tours" className="hover:text-orange-400">
                  {t("footer.tours")}
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-orange-400">
                  {t("footer.hotels")}
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-orange-400">
                  {t("footer.blogs")}
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="hover:text-orange-400">
                  {t("footer.contact_us")}
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:text-orange-400">
                  {t("footer.about_us")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4">
              {t("footer.help")}
            </h4>
            <ul className="space-y-3 text-white/90 text-sm">
              <li>
                <Link to="/terms" className="hover:text-orange-400">
                  {t("footer.terms_of_use")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-orange-400">
                  {t("footer.privacy_policy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4">
              {t("footer.contacts")}
            </h4>
            <ul className="space-y-4 text-white/90 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-orange-400 mt-0.5 text-lg shrink-0" />
                <span className="leading-relaxed">
                  Tầng 8, 123 Nguyễn Huệ, Quận 1, TP.HCM, Việt Nam
                </span>
              </li>

              <li className="flex items-start gap-3">
                <FaPhoneAlt className="text-orange-400 mt-0.5 text-lg shrink-0" />
                <a
                  href="tel:+393463685708"
                  className="hover:text-orange-400 transition"
                >
                  +84 28 1234 5678
                </a>
              </li>

              <li className="flex items-start gap-3">
                <FaEnvelope className="text-orange-400 mt-0.5 text-lg shrink-0" />
                <a
                  href="mailto:italiainlimo@gmail.com"
                  className="hover:text-orange-400 transition break-all"
                >
                  easytravel818@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4">
              {t("footer.social_media")}
            </h4>

            <div className="flex items-center gap-6 text-2xl sm:text-3xl">
              <a
                href="#"
                aria-label="Twitter"
                className="text-orange-400 hover:text-orange-300 transition-transform hover:scale-110"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-orange-400 hover:text-orange-300 transition-transform hover:scale-110"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-orange-400 hover:text-orange-300 transition-transform hover:scale-110"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <hr className="border-t border-white/10 mt-10" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-white/80 py-6 text-sm">
          {t("footer.copyright").replace(
            "2025",
            String(new Date().getFullYear()),
          )}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
