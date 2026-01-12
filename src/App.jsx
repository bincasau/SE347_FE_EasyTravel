import { Home } from "./pages/Home";
import { AboutUs } from "./pages/AboutUs";
import { ContactUs } from "./pages/ContactUs";
import Hotel from "./pages/Hotel";
import HotelDetailPage from "./pages/HotelDetail";
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
import EditProfile from "./pages/EditProfile";
import BookingHistoryTours from "./pages/BookingHistoryTours";
import BookingHistoryHotels from "./pages/BookingHistoryHotels";

import RequireRole from "./pages/TourGuide/RequireRole";
import PastTours from "./pages/TourGuide/PastTours";
import SchedulePage from "./pages/TourGuide/SchedulePage";
import DaysAvailable from "./pages/TourGuide/DaysAvailable";
import GuideProfile from "./pages/TourGuide/GuideProfile";
import TourScheduleDetail from "./pages/TourGuide/TourScheduleDetail";

//  ADMIN
import AdminUserManagementPage from "./pages/Admin/UserManagementPage";
import AdminTourManagementPage from "./pages/Admin/TourManagementPage";
import AdminTourUpsertPage from "./pages/Admin/AdminTourUpsertPage";
import AdminHotelManagementPage from "./pages/Admin/HotelManagementPage";
import AddHotel from "./components/pages/Admin/Hotel/AddHotel";
import UpdateHotel from "./components/pages/Admin/Hotel/UpdateHotel";
import AdminBlogManagementPage from "./pages/Admin/BlogManagementPage";
import AdminBlogUpsertPage from "./pages/Admin/AdminBlogUpsertPage";

// ✅ HOTEL MANAGER
import AddRoom from "./pages/HotelManager/AddRoom";
import Rooms from "./pages/HotelManager/Rooms";
import HotelRevenue from "./pages/HotelManager/HotelRevenue";
import ReportRevenue from "./pages/HotelManager/ReportRevenue";
import RoomEdit from "@/pages/HotelManager/RoomEdit";
import RoomView from "@/pages/HotelManager/RoomView";
import ListBooking from "@/pages/HotelManager/ListBooking";
import MyHotel from "@/pages/HotelManager/MyHotel";

import ScrollToTop from "./utils/ScrollToTop";
import LoginModal from "./pages/Login";
import { useEffect, useState } from "react";
import SignupModal from "./pages/SignUp";

import Forbidden403 from "./pages/Forbidden403";
import NotFound404 from "./pages/NotFound404";

export default function App() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  useEffect(() => {
    document.body.style.overflow = openLogin || openSignup ? "hidden" : "";
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
          <Route path="/detailhotel/:id" element={<HotelDetailPage />} />
          <Route path="/booking-room" element={<RoomBooking />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/detailblog/:id" element={<BlogDetail />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/booking-history/tours" element={<BookingHistoryTours />} />
          <Route path="/booking-history/hotels" element={<BookingHistoryHotels />} />
          <Route path="/403" element={<Forbidden403 />} />

          {/* TourGuide */}
          <Route
            path="/guide/past-tours"
            element={
              <RequireRole role="TOUR_GUIDE">
                <PastTours />
              </RequireRole>
            }
          />
          <Route
            path="/guide/schedule"
            element={
              <RequireRole role="TOUR_GUIDE">
                <SchedulePage />
              </RequireRole>
            }
          />
          <Route
            path="/guide/available-days"
            element={
              <RequireRole role="TOUR_GUIDE">
                <DaysAvailable />
              </RequireRole>
            }
          />
          <Route
            path="/guide/profile"
            element={
              <RequireRole role="TOUR_GUIDE">
                <GuideProfile />
              </RequireRole>
            }
          />
          <Route
            path="/guide/tour/:tourId/schedule"
            element={
              <RequireRole role="TOUR_GUIDE">
                <TourScheduleDetail />
              </RequireRole>
            }
          />

          {/*  Hotel Manager  */}
          <Route
            path="/hotel-manager"
            element={<Navigate to="/hotel-manager/hotels" replace />}
          />

          <Route
            path="/hotel-manager/hotels/addroom/new"
            element={
              <RequireRole role="HOTEL_MANAGER">
                <AddRoom />
              </RequireRole>
            }
          />

          <Route
            path="/hotel-manager/hotels/addroom"
            element={
              <RequireRole role="HOTEL_MANAGER">
                <Rooms />
              </RequireRole>
            }
          />

          <Route
            path="/hotel-manager/revenue"
            element={
              <RequireRole role="HOTEL_MANAGER">
                <HotelRevenue />
              </RequireRole>
            }
          />

          <Route
            path="/hotel-manager/revenue/bookings"
            element={<ListBooking />}
          />

          <Route
            path="/hotel-manager/reports/revenue"
            element={
              <RequireRole role="HOTEL_MANAGER">
                <ReportRevenue />
              </RequireRole>
            }
          />

          <Route
            path="/hotel-manager/rooms/edit"
            element={
              <RequireRole role="HOTEL_MANAGER">
                <RoomEdit />
              </RequireRole>
            }
          />

          <Route
            path="/hotel-manager/rooms/view"
            element={
              <RequireRole role="HOTEL_MANAGER">
                <RoomView />
              </RequireRole>
            }
          />

          <Route
            path="/hotel-manager/myhotel"
            element={
              <RequireRole role="HOTEL_MANAGER">
                <MyHotel />
              </RequireRole>
            }
          />

          {/* Admin */}
          <Route
            path="/Admin/Tours"
            element={
              <RequireRole role="ADMIN">
                <AdminTourManagementPage />
              </RequireRole>
            }
          />
          <Route
            path="/Admin/Tours/new"
            element={
              <RequireRole role="ADMIN">
                <AdminTourUpsertPage />
              </RequireRole>
            }
          />
          <Route
            path="/Admin/Tours/edit/:id"
            element={
              <RequireRole role="ADMIN">
                <AdminTourUpsertPage />
              </RequireRole>
            }
          />
          <Route
            path="/Admin/hotels"
            element={
              <RequireRole role="ADMIN">
                <AdminHotelManagementPage />
              </RequireRole>
            }
          />
          <Route
            path="/Admin/hotels/add"
            element={
              <RequireRole role="ADMIN">
                <AddHotel />
              </RequireRole>
            }
          />
          <Route
            path="/Admin/hotels/update/:id"
            element={
              <RequireRole role="ADMIN">
                <UpdateHotel />
              </RequireRole>
            }
          />
          <Route
            path="/Admin/users"
            element={
              <RequireRole role="ADMIN">
                <AdminUserManagementPage />
              </RequireRole>
            }
          />
          <Route
            path="/Admin/blogs"
            element={
              <RequireRole role="ADMIN">
                <AdminBlogManagementPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/blogs/new"
            element={
              <RequireRole role="ADMIN">
                <AdminBlogUpsertPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/blogs/edit/:id"
            element={
              <RequireRole role="ADMIN">
                <AdminBlogUpsertPage />
              </RequireRole>
            }
          />

          <Route path="*" element={<NotFound404 />} />
        </Routes>

        <Footer />

        {/* LOGIN MODAL */}
        {openLogin && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => e.target === e.currentTarget && setOpenLogin(false)}
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

        {/* SIGNUP MODAL */}
        {openSignup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) =>
              e.target === e.currentTarget && setOpenSignup(false)
            }
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
