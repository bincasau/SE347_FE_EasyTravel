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
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={Logo} alt="EasyTravel" className="h-14 w-auto" />
          <div className="text-2xl font-semibold leading-tight">
            <span className="text-orange-400">Easy</span>
            <div className="-mt-1">Travel</div>
          </div>
        </div>

        <hr className="border-t border-white/10 mt-6 mb-8" />

        {/* Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Links 1 */}
          <div>
            <h4 className="text-xl font-semibold mb-4">
              {t("footer.services")}
            </h4>
            <ul className="space-y-3 text-white/90">
              <li>
                <Link to="/" className="hover:text-orange-400">
                  {t("header.home")}
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
              <li>
                <Link to="/tours" className="hover:text-orange-400">
                  {t("footer.tour_packages")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xl font-semibold mb-4">
              {t("footer.services")}
            </h4>
            <ul className="space-y-3 text-white/90">
              <li>
                <Link to="/book-tour" className="hover:text-orange-400">
                  {t("footer.book_tour")}
                </Link>
              </li>
              <li>
                <Link to="/book-hotel" className="hover:text-orange-400">
                  {t("footer.book_hotel")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-xl font-semibold mb-4">{t("footer.help")}</h4>
            <ul className="space-y-3 text-white/90">
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
            <h4 className="text-xl font-semibold mb-4">
              {t("footer.contacts")}
            </h4>
            <ul className="space-y-4 text-white/90">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-orange-400 mt-1 text-lg" />
                <span>Piazza Napoleone, Lucca, Tuscany</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-orange-400 text-lg" />
                <a
                  href="tel:+393463685708"
                  className="hover:text-orange-400 transition"
                >
                  +39 346 368 5708
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-orange-400 text-lg" />
                <a
                  href="mailto:italiainlimo@gmail.com"
                  className="hover:text-orange-400 transition"
                >
                  italiainlimo@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-xl font-semibold mb-4">
              {t("footer.social_media")}
            </h4>
            <div className="flex items-center gap-6 text-3xl">
              <a
                href="#"
                aria-label="Twitter"
                className="text-orange-400 hover:text-orange-300 transition-all duration-300 transform hover:scale-110"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-orange-400 hover:text-orange-300 transition-all duration-300 transform hover:scale-110"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-orange-400 hover:text-orange-300 transition-all duration-300 transform hover:scale-110"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <hr className="border-t border-white/10 mt-10" />
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-white/80 py-6">
          {t("footer.copyright").replace(
            "2025",
            String(new Date().getFullYear())
          )}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
