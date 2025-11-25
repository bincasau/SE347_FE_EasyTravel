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
import Booking from "./pages/BookingTour";
import Verify from "./pages/Verify";
import Profile from "./pages/Profile";

import ScrollToTop from "./utils/ScrollToTop";
import LoginModal from "./pages/Login";
import { useEffect, useState } from "react";
import SignupModal from "./pages/SignUp";

export default function App() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  useEffect(() => {
    const hasModal = openLogin || openSignup;
    document.body.style.overflow = hasModal ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [openLogin, openSignup]);

  return (
    <LangProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Header
          onOpenLogin={() => setOpenLogin(true)}
          onOpenSignup={() => setOpenSignup(true)}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/detailtour/:id" element={<DetailTour />} />
          <Route path="/tours" element={<Tour />} />
          <Route path="/booking/:tourId" element={<Booking />} />
          <Route path="/hotels" element={<Hotel />} />
          <Route path="/hotels/:hotelId/rooms" element={<Room />} />
          <Route path="/booking-room" element={<RoomBooking />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/detailblog/:id" element={<BlogDetail />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer />

        {/* Login Modal */}
        {openLogin && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpenLogin(false);
            }}
          >
            <LoginModal
              onClose={() => setOpenLogin(false)}
              onOpenSignup={() => {
                setOpenLogin(false);
                setOpenSignup(true);
              }}
            />
          </div>
        )}

        {/* Signup Modal */}
        {openSignup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpenSignup(false);
            }}
          >
            <SignupModal
              onClose={() => setOpenSignup(false)}
              onOpenLogin={() => {
                setOpenSignup(false);
                setOpenLogin(true);
              }}
            />
          </div>
        )}
      </BrowserRouter>
    </LangProvider>
  );
}
