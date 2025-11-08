import { Home } from "./pages/Home";
import { AboutUs } from "./pages/AboutUs";
import { ContactUs } from "./pages/ContactUs";
import Hotel from "./pages/Hotel";
import { Room } from "./pages/Room";
import RoomBooking from "./pages/RoomBooking";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LangProvider } from "@/contexts/LangContext";
import Tour from "./pages/Tour";
import DetailTour from "./pages/DetailTour";
import Booking from "./pages/Booking";

import ScrollToTop from "./utils/ScrollToTop";
import LoginModal from "./pages/Login";
import { useEffect, useState } from "react";
import Signup from "./pages/SignUp";

export default function App() {
  const [openLogin, setOpenLogin] = useState(false);

  // khoá scroll khi mở modal
  useEffect(() => {
    document.body.style.overflow = openLogin ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [openLogin]);

  return (
    <LangProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Header onOpenLogin={() => setOpenLogin(true)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/detailtours" element={<DetailTour />} />
          <Route path="/tours" element={<Tour />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/hotel" element={<Hotel />} />
          <Route path="/hotel/:hotelId" element={<Room />} />
          <Route path="/booking-room" element={<RoomBooking />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/detailblog" element={<BlogDetail />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
        {openLogin && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpenLogin(false);
            }}
          >
            <LoginModal onClose={() => setOpenLogin(false)} />
          </div>
        )}
      </BrowserRouter>
    </LangProvider>
  );
}
