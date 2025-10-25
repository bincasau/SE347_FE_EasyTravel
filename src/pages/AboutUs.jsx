import { AboutFeature } from "../components/pages/AboutUs/AboutFeature";
import { FeatureStrip } from "../components/pages/AboutUs/FeatureStrip";
import { Hero } from "../components/pages/AboutUs/Hero";
import OurMember from "../components/pages/AboutUs/OurMember";
import Testimonials from "../components/pages/AboutUs/Testimonials";
import Travelline from "../components/pages/AboutUs/TravelLine";

export function AboutUs() {
  return (
    <>
      <Hero />
      <AboutFeature />
      <FeatureStrip />
      <Travelline />
      <OurMember />
      <Testimonials />
    </>
  );
}
