import { AboutUs } from "./pages/AboutUs";
import { ContactUs } from "./pages/ContactUs";
import  Tour  from "./pages/Tour";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/" element={<Tour />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
