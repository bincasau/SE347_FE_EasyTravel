import { Home } from "./pages/Home";
import { AboutUs } from "./pages/AboutUs";
import { ContactUs } from "./pages/ContactUs";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LangProvider } from "@/contexts/LangContext";
import Tour from "./pages/Tour";
import DetailTour from "./pages/DetailTour";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Booking from "./pages/Booking";
import ScrollToTop from "./utils/ScrollToTop";

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/detailtours" element={<DetailTour />} />
          <Route path="/tours" element={<Tour />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/detailblog" element={<BlogDetail />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;
