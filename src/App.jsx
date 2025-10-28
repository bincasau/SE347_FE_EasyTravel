import { Home } from "./pages/Home";
import { AboutUs } from "./pages/AboutUs";
import { ContactUs } from "./pages/ContactUs";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LangProvider } from "@/contexts/LangContext";
import Tour from "./pages/Tour";
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
          <Route path="/tours" element={<Tour />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;
