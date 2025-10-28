import HeroSection from "../components/pages/Home/HeroSection";
import PopularDestination from "../components/pages/Home/PopularTours";
import DestinationCarousel from "../components/pages/Home/DestinationCarousel";
import AboutCompany from "../components/pages/Home/AboutCompany";
import PopularHotels from "../components/pages/Home/PopularHotels";
import OfferBanner from "../components/pages/Home/OfferBanner";
import PopularTopics from "../components/pages/Home/PopularTopics";
import WhyChooseUs from "../components/pages/Home/WhyChooseUs";
import CustomerReviews from "../components/pages/Home/CustomerReviews";

export function Home() {
  return (
    <>
      <HeroSection />
      <PopularDestination />
      <DestinationCarousel />
      <AboutCompany />
      <PopularHotels />
      <OfferBanner />
      <PopularTopics />
      <WhyChooseUs />
      <CustomerReviews />
    </>
  );
}
